import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { CookieOptions } from "@supabase/ssr";

// ---------------------------------------------------------------------------
// Typed alias for the server-side Supabase client.
//
// @supabase/ssr v0.6.x was compiled against @supabase/supabase-js ≤ v2.48,
// where SupabaseClient had 3 type params: <Database, SchemaName, Schema>.
// In v2.49+ the class was redesigned to use
//   SupabaseClient<Database, SchemaNameOrClientOptions, SchemaName, Schema, ClientOptions>
// The ssr declaration still exports SupabaseClient<D, "public", Schema> which
// TypeScript resolves against the new 5-param class and ends up inferring
// Schema = never, making every .from() Row/Insert/Update also `never`.
//
// Fix: tell TypeScript the exact type we know is true at runtime.
// `createServerClient` still constructs the client correctly; we only widen
// the static type back to what supabase-js itself would infer.
// ---------------------------------------------------------------------------

import { type TypedSupabaseClient } from "./client";

export async function createClient(): Promise<TypedSupabaseClient> {
  const cookieStore = await cookies();

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll called from a Server Component context — safe to ignore.
            // Token refresh is handled by the middleware on the next request.
          }
        },
      },
    },
  );

  // Cast to the correctly-parameterised SupabaseClient type.
  // The runtime value is exactly this type; we are only correcting the
  // stale declaration emitted by @supabase/ssr@0.6.
  return client as unknown as TypedSupabaseClient;
}
