#!/usr/bin/env node

/**
 * scripts/patch-supabase-ssr.js
 *
 * Postinstall patch for @supabase/ssr@0.6.x + @supabase/supabase-js@2.49+
 *
 * Problem
 * -------
 * @supabase/ssr v0.6.x was compiled against @supabase/supabase-js ≤ v2.48,
 * which exposed internal types under a `dist/module/lib/types` sub-path.
 * That sub-path no longer exists in supabase-js v2.49+; the package was
 * consolidated into a single flat bundle (dist/index.d.mts).
 *
 * As a result, the declaration file:
 *   node_modules/@supabase/ssr/dist/main/createServerClient.d.ts
 *
 * contains the broken import:
 *   import type { GenericSchema, SupabaseClientOptions }
 *     from "@supabase/supabase-js/dist/module/lib/types";
 *
 * TypeScript cannot resolve the import, so GenericSchema falls back to `any`.
 * The SupabaseClient generic chain then infers Schema = never for every
 * .from() call, making Row / Insert / Update all `never` and producing
 * ~30 type errors across the codebase.
 *
 * Fix
 * ---
 * Replace the broken import line with:
 *   1. A correct import of SupabaseClientOptions from "@supabase/supabase-js"
 *      (its public surface, always stable).
 *   2. An inline declaration of GenericSchema that is structurally identical
 *      to the real definition in dist/index.d.mts so the constraint
 *      `Schema extends GenericSchema` still resolves correctly.
 *
 * This script is idempotent — running it twice produces the same result.
 * It is wired up as an `npm run postinstall` step so it re-applies after
 * every `npm install` / `npm ci`.
 */

const fs   = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Target file
// ---------------------------------------------------------------------------

const TARGET = path.join(
  __dirname,
  "..",
  "node_modules",
  "@supabase",
  "ssr",
  "dist",
  "main",
  "createServerClient.d.ts",
);

// ---------------------------------------------------------------------------
// Strings to find / replace
// ---------------------------------------------------------------------------

const BROKEN_IMPORT =
  'import type { GenericSchema, SupabaseClientOptions } from "@supabase/supabase-js/dist/module/lib/types";';

// We split the replacement across two logical statements so that the
// declaration file remains syntactically valid even without a module boundary:
//   • a proper `import type` for SupabaseClientOptions from the public package
//   • an inline `type GenericSchema = ...` that mirrors the real definition
const FIXED_IMPORT = [
  'import type { SupabaseClientOptions } from "@supabase/supabase-js";',
  "type GenericSchema = {",
  "  Tables: Record<string, unknown>;",
  "  Views: Record<string, unknown>;",
  "  Functions: Record<string, unknown>;",
  "};",
].join(" ");

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function patch() {
  // Bail gracefully if the file doesn't exist (wrong ssr version, etc.)
  if (!fs.existsSync(TARGET)) {
    console.log(
      "[patch-supabase-ssr] Target file not found — skipping patch.\n" +
        "  Expected: " + TARGET,
    );
    return;
  }

  const original = fs.readFileSync(TARGET, "utf8");

  // Already patched — nothing to do.
  if (!original.includes(BROKEN_IMPORT)) {
    console.log(
      "[patch-supabase-ssr] Already patched (or target changed) — no action taken.",
    );
    return;
  }

  const patched = original.replace(BROKEN_IMPORT, FIXED_IMPORT);

  if (patched === original) {
    // replace() found no match — shouldn't happen given the check above,
    // but be safe.
    console.warn(
      "[patch-supabase-ssr] WARNING: string replacement produced no change. " +
        "The patch may need to be updated for this version of @supabase/ssr.",
    );
    return;
  }

  fs.writeFileSync(TARGET, patched, "utf8");

  console.log(
    "[patch-supabase-ssr] Patch applied successfully.\n" +
      "  File   : " + TARGET + "\n" +
      "  Removed: " + BROKEN_IMPORT + "\n" +
      "  Added  : " + FIXED_IMPORT,
  );
}

patch();
