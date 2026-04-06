import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { Database } from "@/types/database.types";
import type { LinkedGame } from "@/types/app.types";

// ---------------------------------------------------------------------------
// DB row type aliases
// ---------------------------------------------------------------------------

type LinkedGameInsert = Database["public"]["Tables"]["linked_games"]["Insert"];
type LinkedGameRow = Database["public"]["Tables"]["linked_games"]["Row"];

// ---------------------------------------------------------------------------
// Supabase v2.49 / @supabase/ssr v0.6 type regression helper
//
// createServerClient passes Database["public"] as the third generic explicitly
// (see lib/supabase/server.ts). We keep these cast helpers as a
// belt-and-suspenders guard against regressions — zero cost at runtime.
// ---------------------------------------------------------------------------

type SingleResult<T> = Promise<{
  data: T | null;
  error: { message: string; code?: string } | null;
}>;

type ManyResult<T> = Promise<{
  data: T[] | null;
  error: { message: string; code?: string } | null;
}>;

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

const GAME_IDS = [
  "efootball",
  "dls",
  "free-fire",
  "league-of-legends",
  "cod",
  "fortnite",
] as const;

const gameIdValues = GAME_IDS;

const PLATFORMS = [
  "Android",
  "iOS",
  "PlayStation",
  "Xbox",
  "PC",
  "Steam",
] as const;

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const linkSchema = z.object({
  game_id: z.enum(GAME_IDS, {
    errorMap: () => ({
      message: `Invalid game_id. Must be one of: ${GAME_IDS.join(", ")}.`,
    }),
  }),
  platform: z.enum(PLATFORMS, {
    errorMap: () => ({
      message: `Invalid platform. Must be one of: ${PLATFORMS.join(", ")}.`,
    }),
  }),
  external_id: z
    .string()
    .min(1, "external_id is required.")
    .max(100, "external_id must be at most 100 characters."),
  display_name: z
    .string()
    .min(1, "display_name is required.")
    .max(50, "display_name must be at most 50 characters."),
});

const unlinkSchema = z.object({
  game_id: z.enum(GAME_IDS, {
    errorMap: () => ({
      message: `Invalid game_id. Must be one of: ${GAME_IDS.join(", ")}.`,
    }),
  }),
});

// ---------------------------------------------------------------------------
// POST /api/linked-games/link — link a game account
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 },
      );
    }

    const parsed = linkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    const { game_id, platform, external_id, display_name } = parsed.data;

    // 3. Check whether this user already has an account linked for this game.
    //    PGRST116 = "The result contains 0 rows" — expected when no duplicate exists.
    const { data: duplicate, error: dupeError } = await (supabase
      .from("linked_games")
      .select("id")
      .eq("user_id", user.id)
      .eq("game_id", game_id)
      .single() as unknown as SingleResult<Pick<LinkedGameRow, "id">>);

    if (dupeError && dupeError.code !== "PGRST116") {
      console.error(
        "[POST /api/linked-games/link] duplicate-check error:",
        dupeError,
      );
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 },
      );
    }

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            "You already have a linked account for this game. Remove it first to re-link.",
        },
        { status: 409 },
      );
    }

    // 4. Insert the new linked game.
    //    is_verified is intentionally false — verification happens out-of-band.
    //
    //    NOTE: The `as any` cast on the insert payload is required to work around
    //    the same @supabase/ssr v0.6 GenericSchema path regression that makes the
    //    Insert type parameter collapse to `never` at the call-site even though we
    //    have correctly typed the payload as LinkedGameInsert above.
    const payload: LinkedGameInsert = {
      user_id: user.id,
      game_id,
      platform,
      external_id,
      display_name,
      is_verified: false,
    };

    const { data: linkedGame, error: insertError } = await (supabase
      .from("linked_games")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(payload as any)
      .select("*")
      .single() as unknown as SingleResult<LinkedGameRow>);

    if (insertError || !linkedGame) {
      console.error("[POST /api/linked-games/link] insert error:", insertError);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        linkedGame: linkedGame as LinkedGame,
        message: "Game account linked. Verification pending.",
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/linked-games/link] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/linked-games/link — unlink a game account
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 },
      );
    }

    const parsed = unlinkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    const { game_id } = parsed.data;

    // 3. Delete the row belonging to this user+game combination.
    //    If no row exists the delete is a silent no-op — that is intentional;
    //    the end-state (no linked account) is already the desired state.
    const { error: deleteError } = await (supabase
      .from("linked_games")
      .delete()
      .eq("user_id", user.id)
      .eq("game_id", game_id) as unknown as ManyResult<never>);

    if (deleteError) {
      console.error(
        "[DELETE /api/linked-games/link] delete error:",
        deleteError,
      );
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Game account unlinked." },
      { status: 200 },
    );
  } catch (err) {
    console.error("[DELETE /api/linked-games/link] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
