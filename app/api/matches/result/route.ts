import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { PLATFORM_FEE_PERCENT } from "@/lib/utils/constants";

// ---------------------------------------------------------------------------
// Request body schema
// ---------------------------------------------------------------------------

const resultSchema = z.object({
  match_id: z.string().uuid("match_id must be a valid UUID"),
  winner_id: z.string().uuid("winner_id must be a valid UUID"),
});

// ---------------------------------------------------------------------------
// POST /api/matches/result
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse & validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = resultSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    const { match_id, winner_id } = parsed.data;

    // 3. Fetch the match and verify it exists
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .eq("id", match_id)
      .single();

    if (matchError || !match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // 4. Verify the match is currently in progress
    if (match.status !== "in_progress") {
      return NextResponse.json(
        {
          error: `Cannot submit result for a match with status "${match.status}". Match must be in progress.`,
        },
        { status: 400 },
      );
    }

    // 5. Verify the requesting user is a participant in the match
    const isPlayer1 = match.player_1_id === user.id;
    const isPlayer2 = match.player_2_id === user.id;

    if (!isPlayer1 && !isPlayer2) {
      return NextResponse.json(
        { error: "Forbidden. You are not a participant in this match." },
        { status: 403 },
      );
    }

    // 6. Verify the winner_id is one of the match participants
    if (winner_id !== match.player_1_id && winner_id !== match.player_2_id) {
      return NextResponse.json(
        {
          error:
            "Invalid winner_id. The winner must be one of the match participants.",
        },
        { status: 400 },
      );
    }

    // 7. Derive loser_id
    const loser_id =
      winner_id === match.player_1_id ? match.player_2_id : match.player_1_id;

    if (!loser_id) {
      // Guards against an in_progress match that somehow has no second player
      return NextResponse.json(
        { error: "Match is missing a second player." },
        { status: 400 },
      );
    }

    // 8. Compute prize distribution
    //    Total pot = wager_points * 2 (both players wagered equally).
    //    Platform takes PLATFORM_FEE_PERCENT % of the pot.
    //    Winner receives the remainder.
    const totalPot = match.wager_points * 2;
    const platformFee = Math.floor(totalPot * (PLATFORM_FEE_PERCENT / 100));
    const prize = totalPot - platformFee;

    // TODO: Replace with Supabase RPC for atomic operations.
    // The sequential writes below are NOT atomic. If any step fails after a
    // previous one has committed, the database will be left in an inconsistent
    // state that requires manual admin reconciliation. Wrapping all steps in a
    // single `supabase.rpc("settle_match", { ... })` SQL function is the correct
    // long-term solution to guarantee all-or-nothing execution.

    // 9. (Step 1) Mark the match as completed.
    //    Optimistic-lock on status="in_progress" guards against concurrent submissions.
    const now = new Date().toISOString();

    const { data: completedMatch, error: matchUpdateError } = await supabase
      .from("matches")
      .update({
        status: "completed",
        winner_id,
        completed_at: now,
      })
      .eq("id", match_id)
      .eq("status", "in_progress")
      .select()
      .single();

    if (matchUpdateError || !completedMatch) {
      console.error(
        "[MATCHES_RESULT] Failed to update match status:",
        matchUpdateError,
      );
      return NextResponse.json(
        {
          error:
            "Failed to update match. It may have already been settled by another request.",
        },
        { status: 500 },
      );
    }

    // 10. (Step 2) Fetch both player profiles for current point totals and stats.
    const { data: profiles, error: profilesFetchError } = await supabase
      .from("profiles")
      .select("id, points, wins, losses, total_matches")
      .in("id", [winner_id, loser_id]);

    if (profilesFetchError || !profiles || profiles.length < 2) {
      console.error(
        "[MATCHES_RESULT] Failed to fetch player profiles:",
        profilesFetchError,
      );
      return NextResponse.json(
        { error: "Failed to fetch player profiles for stat update." },
        { status: 500 },
      );
    }

    const winnerProfile = profiles.find((p) => p.id === winner_id);
    const loserProfile = profiles.find((p) => p.id === loser_id);

    if (!winnerProfile || !loserProfile) {
      console.error(
        "[MATCHES_RESULT] Could not identify winner/loser profile.",
      );
      return NextResponse.json(
        { error: "Player profile lookup failed." },
        { status: 500 },
      );
    }

    // 11. (Step 3) Update winner profile.
    //     points        += prize
    //     wins          += 1
    //     total_matches += 1
    //     win_rate       = new_wins / new_total  (rounded to 4 dp)
    const winnerNewWins = winnerProfile.wins + 1;
    const winnerNewTotal = winnerProfile.total_matches + 1;
    const winnerNewWinRate =
      winnerNewTotal > 0
        ? Math.round((winnerNewWins / winnerNewTotal) * 10000) / 10000
        : 0;

    const { error: winnerUpdateError } = await supabase
      .from("profiles")
      .update({
        points: winnerProfile.points + prize,
        wins: winnerNewWins,
        total_matches: winnerNewTotal,
        win_rate: winnerNewWinRate,
      })
      .eq("id", winner_id);

    if (winnerUpdateError) {
      console.error(
        "[MATCHES_RESULT] Failed to update winner profile:",
        winnerUpdateError,
      );
      return NextResponse.json(
        { error: "Failed to update winner profile." },
        { status: 500 },
      );
    }

    // 12. (Step 4) Update loser profile.
    //     points        -= wager_points  (floor at 0 — never go negative)
    //     losses        += 1
    //     total_matches += 1
    //     win_rate       = existing_wins / new_total  (rounded to 4 dp)
    const loserNewLosses = loserProfile.losses + 1;
    const loserNewTotal = loserProfile.total_matches + 1;
    const loserNewWinRate =
      loserNewTotal > 0
        ? Math.round((loserProfile.wins / loserNewTotal) * 10000) / 10000
        : 0;
    const loserNewPoints = Math.max(
      0,
      loserProfile.points - match.wager_points,
    );

    const { error: loserUpdateError } = await supabase
      .from("profiles")
      .update({
        points: loserNewPoints,
        losses: loserNewLosses,
        total_matches: loserNewTotal,
        win_rate: loserNewWinRate,
      })
      .eq("id", loser_id);

    if (loserUpdateError) {
      console.error(
        "[MATCHES_RESULT] Failed to update loser profile:",
        loserUpdateError,
      );
      return NextResponse.json(
        { error: "Failed to update loser profile." },
        { status: 500 },
      );
    }

    // 13. Return settled match + financial summary
    return NextResponse.json(
      {
        match: completedMatch,
        pointsAwarded: prize,
        platformFee,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[MATCHES_RESULT]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
