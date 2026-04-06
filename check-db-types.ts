import { createServerClient } from "@supabase/ssr";
import type { Database } from "./types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

type TestClient = SupabaseClient<Database>;
type Fn = TestClient["from"];
type ProfilesBuilder = ReturnType<TestClient["from"]>;
