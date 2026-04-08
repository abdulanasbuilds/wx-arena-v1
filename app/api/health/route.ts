import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").select("count").limit(1);
    if (error) throw error;
    return NextResponse.json({ status: "ok", supabase: "connected", timestamp: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ status: "error", message: String(err) }, { status: 500 });
  }
}
