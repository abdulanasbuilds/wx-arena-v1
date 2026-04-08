import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Trophy, Target, Swords, Zap } from "lucide-react";
import { StatCard } from "@/components/features/StatCard";

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-[#0d0d14] border border-[#2a2a4e] rounded-2xl p-8">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          <div className="w-24 h-24 rounded-full bg-[#16213e] border-2 border-[#a855f7] flex items-center justify-center text-3xl">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className="w-full h-full rounded-full object-cover" />
            ) : (
              profile.username.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#f1f5f9]">{profile.username}</h1>
            <p className="text-[#94a3b8] mt-2 max-w-2xl">{profile.bio || "No bio yet."}</p>
            <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
              <span className="px-3 py-1 bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30 rounded-lg text-sm font-medium">
                Rank #{profile.rank}
              </span>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium">
                {profile.is_verified ? "Verified Player" : "Player"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Total Matches" 
          value={profile.total_matches} 
          icon={<Swords className="w-4 h-4 text-[#a855f7]" />} 
        />
        <StatCard 
          label="Win Rate" 
          value={`${profile.win_rate.toFixed(1)}%`} 
          icon={<Target className="w-4 h-4 text-[#a855f7]" />} 
        />
        <StatCard 
          label="Wins" 
          value={profile.wins} 
          icon={<Trophy className="w-4 h-4 text-[#a855f7]" />} 
        />
        <StatCard 
          label="WX Points" 
          value={profile.points} 
          icon={<Zap className="w-4 h-4 text-[#a855f7]" />} 
        />
      </div>
    </div>
  );
}
