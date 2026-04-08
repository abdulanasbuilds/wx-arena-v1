import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User, Shield, Bell, Trash2 } from "lucide-react";

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Account Settings</h1>
        <p className="text-[#94a3b8]">Manage your profile and security</p>
      </div>

      <div className="bg-[#0d0d14] border border-[#2a2a4e] rounded-2xl divide-y divide-[#2a2a4e]">
        {/* Profile Info */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-[#a855f7]" />
            <h2 className="font-semibold text-[#f1f5f9]">Profile Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[#94a3b8] mb-2 text-left">Username</label>
              <input 
                type="text" 
                defaultValue={profile?.username}
                className="w-full bg-[#1a1a2e] border border-[#2a2a4e] rounded-xl px-4 py-2.5 text-[#f1f5f9] outline-none focus:border-[#a855f7]" 
              />
            </div>
            <div>
              <label className="block text-sm text-[#94a3b8] mb-2 text-left">Email</label>
              <input 
                type="text" 
                defaultValue={user.email}
                disabled
                className="w-full bg-[#1a1a2e] border border-[#2a2a4e] rounded-xl px-4 py-2.5 text-[#64748b] outline-none" 
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#a855f7]" />
            <h2 className="font-semibold text-[#f1f5f9]">Security</h2>
          </div>
          <button className="px-4 py-2 bg-[#1a1a2e] border border-[#2a2a4e] text-[#f1f5f9] rounded-xl hover:bg-[#252545] transition-colors">
            Update Password
          </button>
        </div>

        {/* Danger Zone */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-red-500" />
            <h2 className="font-semibold text-red-500">Danger Zone</h2>
          </div>
          <button className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
