"use client";

import { useState } from "react";
import { Users, Gamepad2, Search, Plus, Crown, Shield, User, Globe, TrendingUp, Zap, Star, ArrowRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import { GAMES } from "@/lib/utils/constants";
import type { GameId } from "@/types/app.types";
import { motion } from "framer-motion";

// Official Game Keyart for Community Banners
const COMMUNITY_GAME_ART: Record<string, string> = {
  'efootball': 'https://gamingonphone.com/wp-content/uploads/2024/09/efootball-2025-cover.jpg',
  'free-fire': 'https://dl.freefiremobile.com/common/web_static/freefire/images/index/visual.jpg',
  'cod': 'https://images.hdqwalls.com/download/call-of-duty-mobile-game-4k-42-3840x2160.jpg',
  'pubg-mobile': 'https://images.hdqwalls.com/download/pubg-mobile-4k-2m-3840x2160.jpg',
  'ea-fc-24': 'https://media.ea.com/content/dam/ea/fc/fc-25/common/fc25-standard-edition-keyart-16x9.jpg.adapt.crop16x9.1023w.jpg',
  'fortnite': 'https://images.hdqwalls.com/download/fortnite-chapter-4-key-art-4k-72-3840x2160.jpg'
};

interface Community {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  game_id: GameId | null;
  owner_id: string;
  member_count: number;
  max_members: number;
  is_public: boolean;
  is_member?: boolean;
  user_role?: "owner" | "admin" | "moderator" | "member" | null;
  win_rate?: string;
  activity_level?: "High" | "Normal" | "Legendary";
}

const MOCK_COMMUNITIES: Community[] = [
  {
    id: "comm-1",
    name: "EFOOTBALL ELITE GLOBAL",
    description: "The world's premier eFootball clan. Daily tournaments, tactical analysis, and major prize pools.",
    avatar_url: null,
    game_id: "efootball",
    owner_id: "user-1",
    member_count: 1420,
    max_members: 5000,
    is_public: true,
    win_rate: "84%",
    activity_level: "Legendary"
  },
  {
    id: "comm-2",
    name: "FREE FIRE WORLD WARRIORS",
    description: "Global squad recruitment. We dominate ranked lobbies across all continents.",
    avatar_url: null,
    game_id: "free-fire",
    owner_id: "user-2",
    member_count: 890,
    max_members: 2000,
    is_public: true,
    win_rate: "72%",
    activity_level: "High"
  },
  {
    id: "comm-4",
    name: "COD MOBILE GHOST DIVISION",
    description: "Tactical shooters only. Sniper elite division for competitive worldwide ladders.",
    avatar_url: null,
    game_id: "cod",
    owner_id: "user-4",
    member_count: 670,
    max_members: 1500,
    is_public: true,
    win_rate: "68%",
    activity_level: "High"
  },
  {
    id: "comm-5",
    name: "PUBG CONQUEROR CIRCLE",
    description: "Elite survivalists. We train for the biggest global invitations. Serious players only.",
    avatar_url: null,
    game_id: "pubg-mobile",
    owner_id: "user-5",
    member_count: 313,
    max_members: 1000,
    is_public: false,
    win_rate: "91%",
    activity_level: "Legendary"
  },
];

export default function CommunitiesPage() {
  const [activeTab, setActiveTab] = useState<"discover" | "my-communities">("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState<GameId | "all">("all");

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 min-h-screen">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-12 h-1 bg-primary rounded-full" />
            <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em]">Global Networks</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter" style={{ fontFamily: 'var(--font-syne)' }}>
            COMMUNITY <br/> <span className="gradient-text">HUBS.</span>
          </h1>
          <p className="text-[#64748b] text-lg max-w-md font-medium leading-relaxed">
            Join the world's most elite gaming clans. Connect with champions from every continent.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Find Your Squad..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-[300px] bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white focus:border-primary/40 transition-all outline-none"
              />
           </div>
           <Button variant="primary" className="py-4 px-8 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20">
             <Plus size={16} /> Create Hub
           </Button>
        </div>
      </div>

      {/* Stats Ticker (Premium Feature) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Hubs', val: '1.2K', icon: <Users size={16}/> },
          { label: 'Live Matches', val: '450+', icon: <Zap size={16}/> },
          { label: 'Global Winrate', val: '68%', icon: <TrendingUp size={16}/> },
          { label: 'Total Payouts', val: '$2M+', icon: <Star size={16}/> },
        ].map((s, i) => (
          <div key={i} className="glass-pro p-6 rounded-3xl border-white/5 flex items-center gap-4 group hover:bg-white/[0.03] transition-all">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                {s.icon}
             </div>
             <div>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">{s.label}</p>
                <p className="text-xl font-black text-white tracking-tight">{s.val}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Sub-nav */}
      <div className="flex items-center gap-8 border-b border-white/5">
        {['DISCOVER', 'MY CLANS'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab === 'DISCOVER' ? 'discover' : 'my-communities')}
            className={cn(
              "pb-4 text-[11px] font-black tracking-[0.3em] transition-all relative",
              (activeTab === 'discover' && tab === 'DISCOVER') || (activeTab === 'my-communities' && tab === 'MY CLANS')
                ? "text-primary border-b-2 border-primary"
                : "text-white/30 hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
        {MOCK_COMMUNITIES.map((comm) => (
          <CommunityCard key={comm.id} community={comm} />
        ))}
      </div>
    </div>
  );
}

function CommunityCard({ community }: { community: Community }) {
  const banner = COMMUNITY_GAME_ART[community.game_id!] || COMMUNITY_GAME_ART['efootball'];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group glass-pro rounded-[2.5rem] border-white/5 overflow-hidden flex flex-col hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_80px_rgba(124,58,237,0.1)]"
    >
      {/* High-Res Banner Header */}
      <div className="relative h-48 overflow-hidden">
        <Image src={banner} alt={community.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[0.3] group-hover:grayscale-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14] via-[#0d0d14]/40 to-transparent" />
        <div className="absolute top-6 right-6">
           {community.activity_level === 'Legendary' ? (
             <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                <Zap size={10} fill="currentColor"/> LEGENDARY ACTIVITY
             </div>
           ) : (
             <div className="bg-green-500/20 backdrop-blur-md border border-green-500/30 text-green-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> ACTIVE
             </div>
           )}
        </div>
      </div>

      <div className="p-10 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
           <div className="w-10 h-10 rounded-xl bg-[#0d0d14] border border-white/10 flex items-center justify-center text-xl shadow-xl">
             {community.game_id === 'efootball' ? '⚽' : '🔫'}
           </div>
           <div>
             <h3 className="text-xl font-black text-white tracking-tighter" style={{ fontFamily: 'var(--font-syne)' }}>
               {community.name}
             </h3>
             <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">{community.game_id?.toUpperCase()}</p>
           </div>
        </div>

        <p className="text-white/40 text-sm leading-relaxed mb-8 flex-1 font-medium">
          {community.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-10 p-5 bg-white/[0.03] rounded-3xl border border-white/5 group-hover:border-primary/20 transition-all">
           <div>
             <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mb-1">Win Rate</p>
             <p className="text-lg font-black text-green-400 italic tracking-tighter">{community.win_rate}</p>
           </div>
           <div className="text-right">
             <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mb-1">Members</p>
             <p className="text-lg font-black text-white tracking-tighter">{community.member_count}+</p>
           </div>
        </div>

        <div className="flex items-center gap-3 mt-auto">
          <Button variant="primary" className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest group/btn">
            JOIN GLOBAL HUB <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </Button>
          <button className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/30 hover:text-white hover:border-white/30 transition-all">
             <ExternalLink size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
