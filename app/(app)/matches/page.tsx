"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MatchCard } from "@/components/features/MatchCard";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils/cn";
import type { Match, MatchStatus, UserProfile } from "@/types/app.types";
import { Swords, Plus, Inbox, Shield, Globe, Award, TrendingUp, Zap, Search, Filter, Activity } from "lucide-react";
import { MatchmakingQueue } from "@/components/features/MatchmakingQueue";
import { motion, AnimatePresence } from "framer-motion";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapSupabaseProfile(profile: any): UserProfile | null {
  if (!profile) return null;
  return {
    id: profile.id,
    username: profile.username,
    avatar_url: profile.avatar_url,
    bio: profile.bio,
    points: profile.points,
    total_matches: profile.total_matches,
    wins: profile.wins,
    losses: profile.losses,
    win_rate: profile.win_rate,
    rank: profile.rank,
    streak: profile.streak,
    is_verified: profile.is_verified,
    is_pro: profile.is_pro,
    created_at: profile.created_at,
  };
}

function mapSupabaseMatch(match: any): Match {
  return {
    id: match.id,
    game_id: match.game_id,
    match_type: match.match_type,
    status: match.status,
    wager_points: match.wager_points,
    player_1_id: match.player_1_id,
    player_2_id: match.player_2_id ?? null,
    winner_id: match.winner_id ?? null,
    created_at: match.created_at,
    completed_at: match.completed_at,
    player_1: mapSupabaseProfile(match.player_1)!,
    player_2: mapSupabaseProfile(match.player_2),
  };
}

const FILTER_TABS = [
  { label: "ALL ARENAS", value: "all" },
  { label: "PENDING", value: "pending" },
  { label: "LIVE", value: "in_progress" },
  { label: "ARCHIVED", value: "completed" },
  { label: "DISPUTED", value: "disputed" },
];

function EmptyState({ filter, onReset }: { filter: string; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-32 text-center glass-pro rounded-[3rem] border-white/5 bg-[#0d0d14]/50">
      <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
        <Inbox size={40} />
      </div>
      <div className="space-y-2">
        <p className="text-2xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: 'var(--font-syne)' }}>Arena Clearance.</p>
        <p className="text-sm text-white/40 max-w-xs mx-auto font-medium leading-relaxed">No signals found in the {filter} spectral range. Start a new challenge to initialize the grid.</p>
      </div>
      {filter !== "all" && (
        <button onClick={onReset} className="text-[10px] font-black text-primary uppercase tracking-[0.3em] hover:text-primary/80 transition-all">Reset Frequency</button>
      )}
    </div>
  );
}

// ─── MatchesClient ────────────────────────────────────────────────────────────

function MatchesClient({ matches, currentUserId }: { matches: Match[]; currentUserId: string }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const filtered = activeFilter === "all" ? matches : matches.filter((m) => m.status === activeFilter);

  return (
    <div className="space-y-8">
      {/* HUD Filter Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.value;
          const count = tab.value === "all" ? matches.length : matches.filter((m) => m.status === tab.value).length;

          return (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={cn(
                "shrink-0 px-6 py-3.5 rounded-2xl text-[10px] font-black transition-all relative group",
                isActive 
                  ? "bg-primary border border-primary text-white shadow-[0_0_30px_rgba(124,58,237,0.3)] shadow-primary/20" 
                  : "bg-white/[0.03] border border-white/5 text-white/30 hover:text-white"
              )}
            >
              <span className="tracking-[0.3em]">{tab.label}</span>
              {count > 0 && (
                <span className={cn(
                  "ml-3 px-2 py-0.5 rounded-full text-[9px] font-bold tabular-nums",
                  isActive ? "bg-white/20 text-white" : "bg-white/5 text-[#64748b]"
                )}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {filtered.length > 0 ? (
          <motion.div 
            key={activeFilter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filtered.map((match) => (
              <MatchCard key={match.id} match={match} currentUserId={currentUserId} />
            ))}
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <EmptyState filter={activeFilter} onReset={() => setActiveFilter("all")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function MatchesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/login"); return; }
      setUserId(user.id);
      
      const { data: matchesData, error } = await supabase
        .from("matches")
        .select(`*, player_1:profiles!matches_player_1_id_fkey(*), player_2:profiles!matches_player_2_id_fkey(*)`)
        .or(`player_1_id.eq.${user.id},player_2_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      
      if (!error && matchesData) setMatches(matchesData.map(mapSupabaseMatch));
      setIsLoading(false);
    });
  }, [router]);

  if (isLoading) return <div className="flex items-center justify-center min-h-[80vh]"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 min-h-screen">
      {/* Premium Dashboard Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-white/5 pb-16">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-12 h-1 bg-primary rounded-full" />
            <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em]">Combat Headquarters</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.8] tracking-tighter" style={{ fontFamily: 'var(--font-syne)' }}>
            LIVE <span className="gradient-text">ARENA.</span>
          </h1>
          <p className="text-[#64748b] text-xl max-w-lg font-medium leading-relaxed">
            Initialize worldwide challenges, join active combat rooms, and verify your professional rank.
          </p>
        </div>

        <Link href="/matches/new" className="group relative">
           <div className="absolute inset-0 bg-primary/20 blur-2xl group-hover:bg-primary/40 transition-all rounded-3xl" />
           <Button variant="primary" className="relative py-6 px-12 text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20">
             <Plus size={20} className="group-hover:rotate-90 transition-transform" />
             Create New Match
           </Button>
        </Link>
      </div>

      {/* Stats Ticker */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'GLOBAL RANK', val: '#1,240', icon: <Award size={18}/> },
          { label: 'WIN STREAK', val: '5 WINS', icon: <Activity size={18}/> },
          { label: 'LIVE SPECTATORS', val: '4.2K', icon: <Globe size={18}/> },
          { label: 'WAGER POOL', val: '$15K+', icon: <TrendingUp size={18}/> },
        ].map((s, i) => (
          <div key={i} className="glass-pro p-8 rounded-[2.5rem] border-white/5 flex flex-col gap-6 group hover:border-primary/40 transition-all">
             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                {s.icon}
             </div>
             <div>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest leading-none mb-2">{s.label}</p>
                <p className="text-3xl font-black text-white tracking-tighter" style={{ fontFamily: 'var(--font-syne)' }}>{s.val}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Global Radar / Queue */}
        <div className="lg:col-span-4 space-y-8">
           <div className="glass-pro rounded-[3rem] border-white/5 p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl -mr-24 -mt-24 group-hover:bg-primary/10 transition-all" />
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                    <Zap size={20} />
                 </div>
                 <h3 className="text-xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: 'var(--font-syne)' }}>Tactical Queue</h3>
              </div>
              <MatchmakingQueue 
                userId={userId ?? ""} 
                onMatchFound={(opponent) => { console.log("Incoming signal:", opponent); }}
              />
           </div>

           <div className="glass-pro rounded-[3rem] border-white/5 p-10 space-y-8 bg-[#0d0d14]/30">
              <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">PRO VERIFICATION</h3>
              <p className="text-sm text-[#64748b] leading-relaxed font-medium">All signals are monitored by WX-SHIELD and the Global Verdict network to ensure 100% fair play.</p>
              <div className="flex items-center gap-3 text-primary text-[10px] font-black uppercase tracking-widest">
                 <Shield size={16} /> WX COMPLIANCE ACTIVE
              </div>
           </div>
        </div>

        {/* Right: Matches Grid */}
        <div className="lg:col-span-8">
           <MatchesClient matches={matches} currentUserId={userId ?? ""} />
        </div>
      </div>
    </div>
  );
}
