import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Query-param schema
// ---------------------------------------------------------------------------

const querySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => {
      const n = val !== undefined ? parseInt(val, 10) : 50;
      return isNaN(n) ? 50 : Math.min(Math.max(n, 1), 100);
    }),
  offset: z
    .string()
    .optional()
    .transform((val) => {
      const n = val !== undefined ? parseInt(val, 10) : 0;
      return isNaN(n) ? 0 : Math.max(n, 0);
    }),
});

// ---------------------------------------------------------------------------
// GET /api/leaderboard/rankings
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse & validate query params
    const url = new URL(request.url);

    const rawParams = {
      limit: url.searchParams.get("limit") ?? undefined,
      offset: url.searchParams.get("offset") ?? undefined,
    };

    const parsed = querySchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    const { limit, offset } = parsed.data;

    // 3. Fetch the leaderboard page ordered by points descending
    const {
      data: profiles,
      count,
      error: rankingsError,
    } = await supabase
      .from("profiles")
      .select(
        "id, username, avatar_url, points, wins, losses, win_rate, rank, streak, is_verified, is_pro",
        { count: "exact" },
      )
      .order("points", { ascending: false })
      .range(offset, offset + limit - 1);

    if (rankingsError) {
      console.error(
        "[LEADERBOARD_RANKINGS] Supabase query error:",
        rankingsError,
      );
      return NextResponse.json(
        { error: "Failed to fetch leaderboard" },
        { status: 500 },
      );
    }

    const total = count ?? 0;

    // 4. Determine the current user's global rank.
    //    Count profiles with strictly more points than the current user,
    //    then add 1 to convert to a 1-based rank position.
    let currentUserRank: number | null = null;

    const { data: currentUserProfile, error: profileError } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", user.id)
      .single();

    if (profileError || !currentUserProfile) {
      // Non-fatal — user may not have a profile yet (e.g. freshly registered).
      // Return null for currentUserRank rather than failing the whole request.
      console.warn(
        "[LEADERBOARD_RANKINGS] Could not fetch current user profile for rank calculation:",
        profileError,
      );
    } else {
      const { count: aboveCount, error: aboveError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gt("points", currentUserProfile.points);

      if (aboveError) {
        // Non-fatal — leave currentUserRank as null
        console.warn(
          "[LEADERBOARD_RANKINGS] Could not calculate current user rank:",
          aboveError,
        );
      } else {
        currentUserRank = (aboveCount ?? 0) + 1;
      }
    }

    // 5. Return paginated leaderboard + caller's rank context
    return NextResponse.json(
      {
        data: profiles ?? [],
        currentUserRank,
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[LEADERBOARD_RANKINGS]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
