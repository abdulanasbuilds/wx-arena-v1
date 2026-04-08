"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

export async function getSession() {
  const supabase = await createClient();
  // SECURITY: Always use getUser() server-side — it validates the token with Supabase Auth.
  // getSession() only reads the JWT without verification and is insecure on the server.
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    return { session: null, error: error.message };
  }
  
  // Return a session-like shape for backwards compat
  return { session: user ? { user } : null, error: null };
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    return { user: null, error: error.message };
  }
  
  return { user, error: null };
}
