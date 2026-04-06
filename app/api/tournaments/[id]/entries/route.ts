import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimiters, applyRateLimit } from "@/lib/security/rate-limit";
import type { Database } from "@/types/database.types";

// ---------------------------------------------------------------------------
// DB row / insert / update type aliases
// ---------------------------------------------------------------------------

type TournamentRow = Database["public"]["Tables"]["tournaments"]["Row"];
type TournamentUpdate = Database["public"]["Tables"]["tournaments"]["Update"];
type TournamentEntryRow =
  Database["public"]["Tables"]["tournament_entries"]["Row"];
type TournamentEntryInsert =
  Database["public"]["Tables"]["tournament_entries"]["Insert"];
type TournamentEntryUpdate =
  Database["public"]["Tables"]["tournament_entries"]["Update"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type WalletTransactionRow =
  Database["public"]["Tables"]["wallet_transactions"]["Row"];
type WalletTransactionInsert =
  Database["public"]["Tables"]["wallet_transactions"]["Insert"];
type WalletTransactionUpdate =
  Database["public"]["Tables"]["wallet_transactions"]["Update"];

// ---------------------------------------------------------------------------
// Lightweight joined shape returned by the entries SELECT
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

type EntryWithUser = TournamentEntryRow & {
  user: ProfileFields | null;
};

// ---------------------------------------------------------------------------
// Supabase v2.49 / @supabase/ssr v0.6 type regression workaround
//
// @supabase/ssr v0.6 imports GenericSchema from a dist path that was removed
// in @supabase/supabase-js v2.49. This collapses every table's Row/Insert/
// Update generics to `never`, breaking both argument positions (insert/update
// payloads) and return types throughout the builder chain.
//
// Fix: `supabaseFrom<TRow, TInsert, TUpdate>` casts the client to a minimal
// typed interface before calling `.from(table)`. TypeScript then sees the
// correct types for the whole chain without any `any` escaping into call sites.
//
// Remove this helper (and revert usages) once @supabase/ssr ships a fix.
// ---------------------------------------------------------------------------

/** Minimal result shapes we actually await. */
type SingleResult<T> = {
  data: T | null;
  error: { code?: string; message: string } | null;
};

type ListResult<T> = {
  data: T[] | null;
  error: { code?: string; message: string } | null;
  count: number | null;
};

/**
 * Minimal query-builder interfaces — only the methods used in this file.
 * Parameterised on the concrete Row/Insert/Update types so every chained
 * call is fully typed.
 */
interface FilterBuilder<TRow> {
  eq(col: string, val: string | number | boolean): FilterBuilder<TRow>;
  order(
    col: string,
    opts?: { ascending?: boolean; nullsFirst?: boolean },
  ): FilterBuilder<TRow>;
  single(): Promise<SingleResult<TRow>>;
  maybeSingle(): Promise<SingleResult<TRow>>;
  then<TResult1 = ListResult<TRow>, TResult2 = never>(
    onfulfilled?: (value: ListResult<TRow>) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: unknown) => TResult2 | PromiseLike<TResult2>,
  ): Promise<TResult1 | TResult2>;
}

interface InsertBuilder<TRow> {
  select(cols?: string): FilterBuilder<TRow>;
}

interface TableBuilder<TRow, TInsert, TUpdate> {
  select(cols?: string): FilterBuilder<TRow>;
  insert(payload: TInsert | TInsert[]): InsertBuilder<TRow>;
  update(payload: TUpdate): FilterBuilder<TRow>;
}

interface SupabaseShim {
  from<TRow, TInsert, TUpdate>(
    table: string,
  ): TableBuilder<TRow, TInsert, TUpdate>;
}

/**
 * Cast the Supabase client to our minimal shim and call `.from(table)`.
 * All subsequent builder calls on the returned object are correctly typed.
 */
function supabaseFrom<TRow, TInsert = Partial<TRow>, TUpdate = Partial<TRow>>(
  client: unknown,
  table: string,
): TableBuilder<TRow, TInsert, TUpdate> {
  return (client as SupabaseShim).from<TRow, TInsert, TUpdate>(table);
}

// ---------------------------------------------------------------------------
// GET /api/tournaments/[id]/entries — list participants with profiles
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Rate limit
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

    // 4. Fetch entries joined with profiles, aliased as "user" per spec
    const entriesResult = await supabaseFrom<
      EntryWithUser,
      TournamentEntryInsert,
      TournamentEntryUpdate
    >(supabase, "tournament_entries")
      .select(
        "*, user:profiles(id,username,avatar_url,points,wins,losses,win_rate,rank,is_verified,is_pro)",
      )
      .eq("tournament_id", id)
      .order("joined_at", { ascending: true });

    if (entriesResult.error) {
      console.error(
        "[GET /api/tournaments/[id]/entries] Supabase error:",
        entriesResult.error,
      );
      return NextResponse.json(
        { error: "Failed to fetch tournament entries" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { data: entriesResult.data ?? [] },
      { status: 200 },
    );
  } catch (err) {
    console.error("[GET /api/tournaments/[id]/entries]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/tournaments/[id]/entries — join a tournament
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Rate limit
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

    // 4. Fetch tournament — 404 if not found
    const { data: tournament, error: tournamentError } =
      await supabaseFrom<TournamentRow>(supabase, "tournaments")
        .select("*")
        .eq("id", id)
        .single();

    if (tournamentError || !tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 },
      );
    }

    // 5. Must be open for registration — 400 if not
    if (tournament.status !== "open") {
      return NextResponse.json(
        { error: "Tournament is not open for registration" },
        { status: 400 },
      );
    }

    // 6. Capacity check — 400 if full
    if (tournament.current_participants >= tournament.max_participants) {
      return NextResponse.json(
        { error: "Tournament is full" },
        { status: 400 },
      );
    }

    // 7. Duplicate entry check via .single() — PGRST116 means no row (happy path)
    const { data: existingEntry, error: existingEntryError } =
      await supabaseFrom<
        Pick<TournamentEntryRow, "id">,
        TournamentEntryInsert,
        TournamentEntryUpdate
      >(supabase, "tournament_entries")
        .select("id")
        .eq("tournament_id", id)
        .eq("user_id", user.id)
        .single();

    const isNoRowsError = existingEntryError?.code === "PGRST116";

    if (existingEntryError && !isNoRowsError) {
      console.error(
        "[POST /api/tournaments/[id]/entries] Existing entry check error:",
        existingEntryError,
      );
      return NextResponse.json(
        { error: "Failed to verify entry status" },
        { status: 500 },
      );
    }

    if (existingEntry) {
      return NextResponse.json(
        { error: "You have already joined this tournament" },
        { status: 409 },
      );
    }

    // 8. Fetch user's current points
    const { data: profile, error: profileError } = await supabaseFrom<
      Pick<ProfileRow, "points">
    >(supabase, "profiles")
      .select("points")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error(
        "[POST /api/tournaments/[id]/entries] Profile fetch error:",
        profileError,
      );
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: 500 },
      );
    }

    // 9. Points sufficiency check
    if (profile.points < tournament.entry_fee) {
      return NextResponse.json(
        {
          error: "Insufficient points to join this tournament",
          required: tournament.entry_fee,
          available: profile.points,
        },
        { status: 402 },
      );
    }

    // 10. Insert entry
    const entryInsert: TournamentEntryInsert = {
      tournament_id: id,
      user_id: user.id,
    };

    const { data: newEntry, error: insertError } = await supabaseFrom<
      TournamentEntryRow,
      TournamentEntryInsert,
      TournamentEntryUpdate
    >(supabase, "tournament_entries")
      .insert(entryInsert)
      .select("*")
      .single();

    if (insertError || !newEntry) {
      console.error(
        "[POST /api/tournaments/[id]/entries] Insert entry error:",
        insertError,
      );
      return NextResponse.json(
        { error: "Failed to create tournament entry" },
        { status: 500 },
      );
    }

    // 11. Increment current_participants on the tournament
    const { error: incrementError } = await supabaseFrom<
      TournamentRow,
      never,
      TournamentUpdate
    >(supabase, "tournaments")
      .update({ current_participants: tournament.current_participants + 1 })
      .eq("id", id)
      .single();

    if (incrementError) {
      console.error(
        "[POST /api/tournaments/[id]/entries] Increment participants error:",
        incrementError,
      );
      // Non-fatal — entry was created; log and continue
    }

    // 12. Deduct entry fee from user's points
    const { error: deductError } = await supabaseFrom<
      ProfileRow,
      never,
      ProfileUpdate
    >(supabase, "profiles")
      .update({ points: profile.points - tournament.entry_fee })
      .eq("id", user.id)
      .single();

    if (deductError) {
      console.error(
        "[POST /api/tournaments/[id]/entries] Deduct points error:",
        deductError,
      );
      return NextResponse.json(
        { error: "Failed to deduct entry fee" },
        { status: 500 },
      );
    }

    // 13. Log wallet transaction
    const txInsert: WalletTransactionInsert = {
      user_id: user.id,
      type: "spend",
      points: -tournament.entry_fee,
      description: `Tournament entry: ${tournament.title}`,
    };

    const { error: txError } = await supabaseFrom<
      WalletTransactionRow,
      WalletTransactionInsert,
      WalletTransactionUpdate
    >(supabase, "wallet_transactions")
      .insert(txInsert)
      .select("id")
      .single();

    if (txError) {
      console.error(
        "[POST /api/tournaments/[id]/entries] Wallet transaction error:",
        txError,
      );
      // Non-fatal — entry and deduction succeeded; log and continue
    }

    return NextResponse.json(
      {
        entry: newEntry,
        message: "Successfully joined tournament",
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/tournaments/[id]/entries]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
