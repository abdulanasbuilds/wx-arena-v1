import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { MatchStatus, GameId } from "@/types/app.types";

// ---------------------------------------------------------------------------
// Query-param schema
// ---------------------------------------------------------------------------

const querySchema = z.object({
  status: z
    .enum(["pending", "in_progress", "completed", "disputed", "cancelled"])
    .optional(),
  game_id: z
    .enum([
      "efootball",
      "dls",
      "free-fire",
      "league-of-legends",
      "cod",
      "fortnite",
    ])
    .optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      const n = val !== undefined ? parseInt(val, 10) : 20;
      return isNaN(n) ? 20 : Math.min(Math.max(n, 1), 50);
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
// GET /api/matches/list
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
      status: url.searchParams.get("status") ?? undefined,
      game_id: url.searchParams.get("game_id") ?? undefined,
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

    const { status, game_id, limit, offset } = parsed.data;

    // 3. Build query — always scoped to the current user (player_1 or player_2)
    let query = supabase
      .from("matches")
      .select(
        "*, player_1:profiles!matches_player_1_id_fkey(*), player_2:profiles!matches_player_2_id_fkey(*)",
        { count: "exact" },
      )
      .or(`player_1_id.eq.${user.id},player_2_id.eq.${user.id}`);

    // 4. Optional filters
    if (status !== undefined) {
      query = query.eq("status", status as MatchStatus);
    }

    if (game_id !== undefined) {
      query = query.eq("game_id", game_id as GameId);
    }

    // 5. Order + pagination
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // 6. Execute
    const { data: matches, count, error } = await query;

    if (error) {
      console.error("[MATCHES_LIST] Supabase query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch matches" },
        { status: 500 },
      );
    }

    const total = count ?? 0;

    return NextResponse.json(
      {
        data: matches ?? [],
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[MATCHES_LIST]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
