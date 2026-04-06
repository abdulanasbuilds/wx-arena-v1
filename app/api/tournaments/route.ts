import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimiters, applyRateLimit } from "@/lib/security/rate-limit";
import type { TournamentStatus, GameId } from "@/types/app.types";
import type { Database } from "@/types/database.types";

// ---------------------------------------------------------------------------
// DB row type aliases
// ---------------------------------------------------------------------------

type TournamentRow = Database["public"]["Tables"]["tournaments"]["Row"];

// ---------------------------------------------------------------------------
// Supabase v2.49 / @supabase/ssr v0.6 type regression helper
//
// The SSR package imports GenericSchema from
// `@supabase/supabase-js/dist/module/lib/types`, a path that was removed in
// the v2.49 dist restructure. This makes every `.select()` result resolve to
// `never` instead of the correct row type. We work around it by casting
// through `unknown` to the explicit DB type.
// Remove these casts once @supabase/ssr ships a fix.
// ---------------------------------------------------------------------------

type ManyResult<T> = Promise<{
  data: T[] | null;
  error: { message: string } | null;
  count: number | null;
}>;

// ---------------------------------------------------------------------------
// Zod schemas for query-param validation
// ---------------------------------------------------------------------------

const tournamentStatusValues: [TournamentStatus, ...TournamentStatus[]] = [
  "open",
  "in_progress",
  "completed",
  "cancelled",
];

const gameIdValues: [GameId, ...GameId[]] = [
  "efootball",
  "dls",
  "free-fire",
  "pubg-mobile",
  "cod-mobile",
  "fc25",
];

const listQuerySchema = z.object({
  status: z.enum(tournamentStatusValues).optional(),
  game_id: z.enum(gameIdValues).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

// ---------------------------------------------------------------------------
// GET /api/tournaments — list tournaments (paginated, filterable)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    // 1. Rate limit (keyed by IP)
    const rateLimitResponse = await applyRateLimit(
      request,
      rateLimiters.general,
    );
    if (rateLimitResponse) return rateLimitResponse;

    // 2. Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Parse & validate query params
    const { searchParams } = new URL(request.url);
    const rawParams = {
      status: searchParams.get("status") ?? undefined,
      game_id: searchParams.get("game_id") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
    };

    const parsed = listQuerySchema.safeParse(rawParams);
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

    // 4. Build query
    // NOTE: The explicit cast on the query result works around a known
    // type-inference regression in @supabase/ssr v0.6 + @supabase/supabase-js
    // v2.49. The SSR package imports GenericSchema from a dist path that no
    // longer exists after the v2.49 restructure, causing every .select() result
    // to resolve to `never`. Remove the cast once @supabase/ssr ships a fix.
    let query = supabase
      .from("tournaments")
      .select("*", { count: "exact" })
      .order("start_time", { ascending: true })
      .range(offset, offset + limit - 1);

    if (status !== undefined) {
      query = query.eq("status", status);
    }

    if (game_id !== undefined) {
      query = query.eq("game_id", game_id);
    }

    // 5. Execute
    const {
      data: rawData,
      error,
      count,
    } = await (query as unknown as ManyResult<TournamentRow>);

    if (error) {
      console.error("[GET /api/tournaments] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch tournaments" },
        { status: 500 },
      );
    }

    const total = count ?? 0;
    const data = rawData ?? [];

    return NextResponse.json(
      {
        data,
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[GET /api/tournaments]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/tournaments — restricted in MVP
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit (keyed by IP)
    const rateLimitResponse = await applyRateLimit(
      request,
      rateLimiters.general,
    );
    if (rateLimitResponse) return rateLimitResponse;

    // 2. Auth check (validate the caller is authenticated before returning 403)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Tournament creation is admin-only in MVP" },
      { status: 403 },
    );
  } catch (err) {
    console.error("[POST /api/tournaments]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
