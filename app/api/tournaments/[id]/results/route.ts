import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimiters, applyRateLimit } from "@/lib/security/rate-limit";
import type { Database } from "@/types/database.types";

// ---------------------------------------------------------------------------
// DB row type aliases
// ---------------------------------------------------------------------------

type TournamentRow = Database["public"]["Tables"]["tournaments"]["Row"];
type TournamentEntryRow =
  Database["public"]["Tables"]["tournament_entries"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

// ---------------------------------------------------------------------------
// Lightweight joined shape returned by the results SELECT
// ---------------------------------------------------------------------------

type ProfileFields = Pick<
  ProfileRow,
  | "id"
  | "username"
  | "avatar_url"
  | "points"
  | "wins"
  | "losses"
  | "win_rate"
  | "rank"
  | "is_verified"
  | "is_pro"
>;

type ResultEntryWithProfile = TournamentEntryRow & {
  user: ProfileFields | null;
};

// ---------------------------------------------------------------------------
// Supabase v2.49 / @supabase/ssr v0.6 type regression helper
//
// The SSR package imports GenericSchema from
// `@supabase/supabase-js/dist/module/lib/types`, a path that was removed in
// the v2.49 dist restructure. This makes every `.select()` result resolve to
// `never` instead of the correct row type. We work around it by casting the
// entire builder expression through `unknown` to the explicit DB type —
// never casting individual arguments to `any`.
// Remove these casts once @supabase/ssr ships a fix.
// ---------------------------------------------------------------------------

type SingleResult<T> = Promise<{
  data: T | null;
  error: { message: string } | null;
}>;

// ---------------------------------------------------------------------------
// GET /api/tournaments/[id]/results — get completed tournament results
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    // 3. Resolve async params (Next.js 16)
    const { id } = await params;

    // 4. Fetch the tournament — 404 if missing
    const { data: tournament, error: tournamentError } = await (supabase
      .from("tournaments")
      .select("*")
      .eq("id", id)
      .single() as unknown as SingleResult<TournamentRow>);

    if (tournamentError || !tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 },
      );
    }

    // 5. Only return results for completed tournaments — 400 per spec
    if (tournament.status !== "completed") {
      return NextResponse.json(
        { error: "Tournament not yet completed" },
        { status: 400 },
      );
    }

    // 6. Fetch entries ordered by final_rank ASC (nulls last), joined with profiles
    const { data: results, error: resultsError } = await (supabase
      .from("tournament_entries")
      .select(
        `
        *,
        user:profiles (
          id,
          username,
          avatar_url,
          points,
          wins,
          losses,
          win_rate,
          rank,
          is_verified,
          is_pro
        )
        `,
      )
      .eq("tournament_id", id)
      .order("final_rank", {
        ascending: true,
        nullsFirst: false,
      }) as unknown as SingleResult<ResultEntryWithProfile[]>);

    if (resultsError) {
      console.error(
        "[GET /api/tournaments/[id]/results] Supabase error:",
        resultsError,
      );
      return NextResponse.json(
        { error: "Failed to fetch tournament results" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        tournament,
        results: results ?? [],
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[GET /api/tournaments/[id]/results]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
