import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { rateLimiters, applyRateLimit } from "@/lib/security/rate-limit";
import { MIN_WAGER_POINTS, MAX_WAGER_POINTS } from "@/lib/utils/constants";

// ---------------------------------------------------------------------------
// Request body schema
// ---------------------------------------------------------------------------

const queueSchema = z.object({
  game_id: z.enum([
    "efootball",
    "dls",
    "free-fire",
    "league-of-legends",
    "cod",
    "fortnite",
  ]),
  match_type: z.enum(["1v1", "2v2", "3v3", "Squad"]),
  wager_points: z
    .number({ invalid_type_error: "wager_points must be a number" })
    .int("wager_points must be an integer")
    .min(MIN_WAGER_POINTS, `Minimum wager is ${MIN_WAGER_POINTS} WX Points`)
    .max(MAX_WAGER_POINTS, `Maximum wager is ${MAX_WAGER_POINTS} WX Points`),
});

// ---------------------------------------------------------------------------
// POST /api/matches/queue
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

    // 2. Rate limit — keyed by authenticated user id
    const rateLimitResponse = await applyRateLimit(
      request,
      rateLimiters.matchQueue,
      user.id,
    );
    if (rateLimitResponse) return rateLimitResponse;

    // 3. Parse & validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = queueSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    const { game_id, match_type, wager_points } = parsed.data;

    // 4. Verify the user has enough points to cover the wager
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("[MATCHES_QUEUE] Profile fetch error:", profileError);
      return NextResponse.json(
        { error: "Could not retrieve user profile" },
        { status: 500 },
      );
    }

    if (profile.points < wager_points) {
      return NextResponse.json(
        {
          error: `Insufficient points. You need at least ${wager_points} WX Points.`,
        },
        { status: 400 },
      );
    }

    // 5. Look for an existing pending match to join.
    //    Match must be: status=pending, same game_id, same match_type,
    //    player_1_id != current user, and player_2_id is null (open slot).
    const { data: pendingMatches, error: searchError } = await supabase
      .from("matches")
      .select("*")
      .eq("status", "pending")
      .eq("game_id", game_id)
      .eq("match_type", match_type)
      .neq("player_1_id", user.id)
      .is("player_2_id", null)
      .eq("wager_points", wager_points)
      .order("created_at", { ascending: true }) // FIFO — oldest open slot first
      .limit(1);

    if (searchError) {
      console.error("[MATCHES_QUEUE] Match search error:", searchError);
      return NextResponse.json(
        { error: "Failed to search for available matches" },
        { status: 500 },
      );
    }

    const existingMatch = pendingMatches?.[0] ?? null;

    // 6a. A suitable match exists — try to join it
    if (existingMatch) {
      const { data: joinedMatch, error: joinError } = await supabase
        .from("matches")
        .update({
          player_2_id: user.id,
          status: "in_progress",
        })
        .eq("id", existingMatch.id)
        // Optimistic-lock: only succeed if the row is still open.
        // Guards against a race condition where two users attempt to join
        // the same pending match simultaneously.
        .eq("status", "pending")
        .is("player_2_id", null)
        .select()
        .single();

      if (!joinError && joinedMatch) {
        return NextResponse.json(
          { match: joinedMatch, joined: true },
          { status: 200 },
        );
      }

      // The slot was claimed by another user between our SELECT and UPDATE.
      // Fall through and create a new pending match for this user instead.
      console.warn(
        "[MATCHES_QUEUE] Race condition on match join — creating new match instead. matchId:",
        existingMatch.id,
      );
    }

    // 6b. No suitable match found (or race condition above) — create a new one
    const { data: newMatch, error: createError } = await supabase
      .from("matches")
      .insert({
        game_id,
        match_type,
        wager_points,
        player_1_id: user.id,
        status: "pending",
      })
      .select()
      .single();

    if (createError || !newMatch) {
      console.error("[MATCHES_QUEUE] Match creation error:", createError);
      return NextResponse.json(
        { error: "Failed to create match" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { match: newMatch, joined: false },
      { status: 201 },
    );
  } catch (err) {
    console.error("[MATCHES_QUEUE]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
