/**
 * Shim for @supabase/supabase-js/dist/module/lib/types
 *
 * @supabase/ssr v0.6 imports `GenericSchema` (and related types) from
 * "@supabase/supabase-js/dist/module/lib/types", but that path no longer
 * exists in @supabase/supabase-js v2.49+. The dist layout changed to a
 * flat bundle (dist/index.d.mts) and none of the internal types are
 * individually exported.
 *
 * tsconfig.json re-maps this broken import to point here so TypeScript can
 * resolve it. We manually re-declare the minimal subset of types that
 * @supabase/ssr needs — keeping them structurally compatible with the real
 * definitions in dist/index.d.mts so the Supabase client generic chain
 * (Database → Schema → Table → Row/Insert/Update) resolves correctly instead
 * of collapsing to `never`.
 */

// ---------------------------------------------------------------------------
// GenericTable / GenericView / GenericFunction — building blocks
// ---------------------------------------------------------------------------

export type GenericTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: unknown[];
};

export type GenericUpdatableView = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: unknown[];
};

export type GenericNonUpdatableView = {
  Row: Record<string, unknown>;
  Relationships: unknown[];
};

export type GenericView = GenericUpdatableView | GenericNonUpdatableView;

export type GenericFunction = {
  Args: Record<string, unknown>;
  Returns: unknown;
};

// ---------------------------------------------------------------------------
// GenericSchema — the top-level constraint used by createServerClient<..., Schema>
// ---------------------------------------------------------------------------

export type GenericSchema = {
  Tables: Record<string, GenericTable>;
  Views: Record<string, GenericView>;
  Functions: Record<string, GenericFunction>;
};

// ---------------------------------------------------------------------------
// SupabaseClientOptions — re-exported so @supabase/ssr can import it from
// this path if needed (guards against future ssr versions importing more types)
// ---------------------------------------------------------------------------

export type SupabaseClientOptions<SchemaName extends string = "public"> = {
  db?: {
    schema?: SchemaName;
  };
  auth?: {
    autoRefreshToken?: boolean;
    persistSession?: boolean;
    detectSessionInUrl?: boolean;
    flowType?: "implicit" | "pkce";
    storage?: unknown;
    storageKey?: string;
    lock?: unknown;
    debug?: boolean;
  };
  global?: {
    headers?: Record<string, string>;
    fetch?: typeof fetch;
  };
  realtime?: Record<string, unknown>;
};
