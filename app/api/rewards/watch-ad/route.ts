import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimiters, applyRateLimit } from "@/lib/security/rate-limit";
import { AD_REWARD_POINTS } from "@/lib/utils/constants";
import type { Database } from "@/types/database.types";

// ---------------------------------------------------------------------------
// DB row type aliases
// ---------------------------------------------------------------------------

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type WalletTransactionInsert =
  Database["public"]["Tables"]["wallet_transactions"]["Insert"];
type WalletTransactionRow =
  Database["public"]["Tables"]["wallet_transactions"]["Row"];

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

type MutationResult = Promise<{
  error: { message: string; code?: string } | null;
}>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * 12 minutes in milliseconds — the minimum gap between consecutive ad reward
 * claims.  5 views per hour (enforced by Upstash) ÷ 60 min = 12 min minimum.
 */
const AD_COOLDOWN_MS = 12 * 60 * 1000; // 12 minutes

// ---------------------------------------------------------------------------
// POST /api/rewards/watch-ad — claim ad reward points
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

    // 2. Apply Upstash rate limit — hard cap of 5 ad rewards per hour per user.
    //    Keyed by user.id so limits are per-account, not per-IP.
    //    The 12-minute cooldown below is the secondary per-claim guard.
    const rateLimitResponse = await applyRateLimit(
      request,
      rateLimiters.adReward,
      user.id,
    );
    if (rateLimitResponse) return rateLimitResponse;

    // 3. Check per-claim 12-minute cooldown via the most recent "Watch Ad"
    //    wallet transaction for this user.
    //
    //    We use .ilike() (case-insensitive LIKE) matching the spec's
    //    `description ILIKE "%Watch Ad%"` requirement, and intentionally
    //    ignore the PGRST116 "no rows" error — it simply means no prior claim.
    //
    //    NOTE: The `as unknown as SingleResult<...>` cast guards against the
    //    @supabase/ssr v0.6 GenericSchema path regression (see server.ts).
    const { data: lastClaim } = await (supabase
      .from("wallet_transactions")
      .select("id, created_at")
      .eq("user_id", user.id)
      .eq("type", "earn")
      .ilike("description", "%Watch Ad%")
      .order("created_at", { ascending: false })
      .limit(1)
      .single() as unknown as SingleResult<
      Pick<WalletTransactionRow, "id" | "created_at">
    >);

    if (lastClaim) {
      const lastClaimTime = new Date(lastClaim.created_at).getTime();
      const elapsed = Date.now() - lastClaimTime;

      if (elapsed < AD_COOLDOWN_MS) {
        const nextClaimAt = new Date(
          lastClaimTime + AD_COOLDOWN_MS,
        ).toISOString();
        return NextResponse.json(
          {
            error: "Please wait before claiming again.",
            nextClaimAt,
          },
          { status: 429 },
        );
      }
    }

    // 4. Award points via secure RPC.
    const { error: awardError } = await supabase.rpc("award_points_secure", {
      u_id: user.id,
      amount: AD_REWARD_POINTS,
      reason: "Watch Ad reward",
    });

    if (awardError) {
      console.error("[POST /api/rewards/watch-ad] Failed to award points:", awardError);
      return NextResponse.json(
        { error: "Failed to credit reward points." },
        { status: 500 }
      );
    }

    // Fetch new balance to return
    const { data: profile } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", user.id)
      .single();

    const newBalance = profile?.points || 0;

    // 5. Return success payload.
    return NextResponse.json(
      {
        pointsAwarded: AD_REWARD_POINTS,
        newBalance,
        message: `You earned ${AD_REWARD_POINTS} WX Points!`,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[POST /api/rewards/watch-ad] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
