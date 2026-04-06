import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimiters, applyRateLimit } from "@/lib/security/rate-limit";
import type { Database } from "@/types/database.types";

// ---------------------------------------------------------------------------
// DB row type aliases
// ---------------------------------------------------------------------------

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

// ---------------------------------------------------------------------------
// Supabase v2.49 / @supabase/ssr v0.6 type regression helper
//
// createServerClient passes Database["public"] as the third generic explicitly
// (see lib/supabase/server.ts), which should give correct Row inference.
// We keep a typed cast helper here as a belt-and-suspenders guard in case the
// upstream fix regresses again — it costs nothing at runtime.
// ---------------------------------------------------------------------------

type SingleResult<T> = Promise<{
  data: T | null;
  error: { message: string; code?: string } | null;
}>;

// ---------------------------------------------------------------------------
// GET /api/wallet/balance
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Rate limit — keyed by IP via general limiter
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

    // 3. Fetch points from profiles — single row scoped strictly to the
    //    authenticated user.  The `as unknown as SingleResult<...>` cast
    //    guards against the @supabase/ssr v0.6 GenericSchema path regression.
    const { data: profile, error } = await (supabase
      .from("profiles")
      .select("points")
      .eq("id", user.id)
      .single() as unknown as SingleResult<Pick<ProfileRow, "points">>);

    // PGRST116 = "The result contains 0 rows" — profile not yet created
    if (error?.code === "PGRST116" || (!error && !profile)) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (error) {
      console.error("[GET /api/wallet/balance] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch wallet balance" },
        { status: 500 },
      );
    }

    // profile is guaranteed non-null here
    return NextResponse.json(
      {
        points: profile!.points,
        userId: user.id,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[GET /api/wallet/balance] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
