import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { rateLimiters, applyRateLimit } from "@/lib/security/rate-limit";
import type { Database } from "@/types/database.types";
import type { WalletTransaction } from "@/types/app.types";

// ---------------------------------------------------------------------------
// DB row type aliases
// ---------------------------------------------------------------------------

type WalletTransactionRow =
  Database["public"]["Tables"]["wallet_transactions"]["Row"];

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
  count: number | null;
}>;

// ---------------------------------------------------------------------------
// Zod schema — query param validation
// ---------------------------------------------------------------------------

const TRANSACTION_TYPE_VALUES = [
  "earn",
  "spend",
  "wager",
  "win",
  "refund",
  "purchase",
] as const satisfies readonly WalletTransaction["type"][];

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  type: z.enum(TRANSACTION_TYPE_VALUES).optional(),
});

// ---------------------------------------------------------------------------
// GET /api/wallet/transactions — paginated transaction history, newest first
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

    // 3. Parse & validate query params
    const { searchParams } = new URL(request.url);
    const rawParams = {
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
      type: searchParams.get("type") ?? undefined,
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

    const { limit, offset, type } = parsed.data;

    // 4. Build query — scoped strictly to the authenticated user.
    //    The explicit `as unknown as ManyResult<...>` cast guards against the
    //    @supabase/ssr v0.6 GenericSchema path regression (see server.ts comment).
    let query = supabase
      .from("wallet_transactions")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (type !== undefined) {
      query = query.eq("type", type);
    }

    // 5. Execute
    const {
      data: rawData,
      error,
      count,
    } = await (query as unknown as ManyResult<WalletTransactionRow>);

    if (error) {
      console.error("[GET /api/wallet/transactions] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch transactions" },
        { status: 500 },
      );
    }

    const total = count ?? 0;
    const data: WalletTransactionRow[] = rawData ?? [];

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
    console.error("[GET /api/wallet/transactions] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
