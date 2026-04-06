import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

// ---------------------------------------------------------------------------
// DB row type alias
// ---------------------------------------------------------------------------

type LinkedGameRow = Database["public"]["Tables"]["linked_games"]["Row"];

// ---------------------------------------------------------------------------
// Supabase v2.49 / @supabase/ssr v0.6 type regression helper
//
// createServerClient passes Database["public"] as the third generic explicitly
// (see lib/supabase/server.ts). We keep the cast helper as a belt-and-suspenders
// guard against regressions — it is zero-cost at runtime.
// ---------------------------------------------------------------------------

type ManyResult<T> = Promise<{
  data: T[] | null;
  error: { message: string; code?: string } | null;
}>;

// ---------------------------------------------------------------------------
// GET /api/linked-games/list — fetch all linked game accounts for the
//                              authenticated user, newest first
// ---------------------------------------------------------------------------

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch all linked games scoped strictly to the authenticated user,
    //    ordered newest-first.  The `as unknown as ManyResult<...>` cast guards
    //    against the @supabase/ssr v0.6 GenericSchema path regression.
    const { data: linkedGames, error } = await (supabase
      .from("linked_games")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      }) as unknown as ManyResult<LinkedGameRow>);

    if (error) {
      console.error("[GET /api/linked-games/list] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch linked games" },
        { status: 500 },
      );
    }

    // An empty array is a valid successful response — the user simply has no
    // linked accounts yet.
    return NextResponse.json({ data: linkedGames ?? [] }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/linked-games/list] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
