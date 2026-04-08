"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { GAMES } from "@/lib/utils/constants";
import type { Match, MatchStatus } from "@/types/app.types";
import { Zap, Trophy, TrendingUp, Shield, ArrowRight, User } from "lucide-react";

interface MatchCardProps {
  match: Match;
  currentUserId?: string;
}

function getGameInfo(gameId: string) {
  return GAMES.find((g) => g.id === gameId) ?? GAMES[0];
}

function getStatusConfig(status: MatchStatus): {
  label: string;
  className: string;
  pulse: boolean;
  icon: any;
} {
  switch (status) {
    case "pending":
      return {
        label: "SYNCING SIGNAL",
        className: "bg-amber-500/15 text-amber-500 border-amber-500/30",
        pulse: false,
        icon: TrendingUp
      };
    case "in_progress":
      return {
        label: "LIVE COMBAT",
        className: "bg-green-500/15 text-green-500 border-green-500/30",
        pulse: true,
        icon: Zap
      };
    case "completed":
      return {
        label: "ARCHIVED",
        className: "bg-white/5 text-white/30 border-white/5",
        pulse: false,
        icon: Shield
      };
    case "disputed":
      return {
        label: "DISPUTED NODE",
        className: "bg-red-500/15 text-red-500 border-red-500/30",
        pulse: false,
        icon: Shield
      };
    default:
      return {
        label: status.toUpperCase(),
        className: "bg-white/5 text-white/30 border-white/5",
        pulse: false,
        icon: Shield
      };
  }
}

export function MatchCard({ match, currentUserId }: MatchCardProps) {
  const game = getGameInfo(match.game_id);
  const statusConfig = getStatusConfig(match.status);
  const p1 = match.player_1;
  const p2 = match.player_2;
  const isP1 = p1?.id === currentUserId;
  const isP2 = p2?.id === currentUserId;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={cn(
        "group glass-pro rounded-[2rem] border-white/5 p-8 transition-all duration-500 relative overflow-hidden flex flex-col gap-8",
        (isP1 || isP2) ? "border-primary/40 bg-primary/5" : "hover:border-primary/20"
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all pointer-events-none" />

      {/* Header HUD */}
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0d0d14] border border-white/10 flex items-center justify-center p-2.5">
               <span className="text-xl leading-none">{game.emoji}</span>
            </div>
            <div>
               <h4 className="text-sm font-black text-white tracking-widest uppercase">{game.shortName}</h4>
               <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">{match.match_type} SPECTRAL</p>
            </div>
         </div>
         
         <div className={cn(
           "flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border",
           statusConfig.className
         )}>
           {statusConfig.pulse && (
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
               <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
             </span>
           )}
           <statusConfig.icon size={10} />
           {statusConfig.label}
         </div>
      </div>

      {/* Combatants VS row */}
      <div className="flex items-center justify-between gap-6 py-4">
         <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-500",
              isP1 ? "border-primary shadow-[0_0_20px_rgba(124,58,237,0.2)]" : "border-white/5"
            )}>
               <User className={cn(isP1 ? "text-primary" : "text-white/20")} size={32} />
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest truncate w-full text-center",
              isP1 ? "text-primary" : "text-white/40"
            )}>{p1?.username || "RECRUIT"}</span>
         </div>

         <div className="flex flex-col items-center gap-1">
            <div className="text-[10px] font-black text-white/10 italic">VS</div>
            <div className="w-8 h-px bg-white/5" />
         </div>

         <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-500",
              isP2 ? "border-primary shadow-[0_0_20px_rgba(124,58,237,0.2)]" : "border-white/5"
            )}>
               <User className={cn(isP2 ? "text-primary" : "text-white/20")} size={32} />
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest truncate w-full text-center",
              isP2 ? "text-primary" : "text-white/40"
            )}>{p2?.username || "RECRUIT"}</span>
         </div>
      </div>

      {/* Payout / Pot HUD */}
      <div className="grid grid-cols-2 gap-4 mt-auto">
         <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl">
            <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mb-1">STAKES</p>
            <div className="flex items-center gap-2">
               <Trophy size={14} className="text-amber-500" />
               <span className="text-lg font-black text-white tracking-tighter tabular-nums">{match.wager_points}</span>
            </div>
         </div>
         <div className="p-5 bg-primary/10 border border-primary/20 rounded-2xl">
            <p className="text-[9px] text-primary font-black uppercase tracking-widest mb-1">JACKPOT</p>
            <div className="flex items-center gap-2">
               <Zap size={14} className="text-primary" />
               <span className="text-lg font-black text-white tracking-tighter tabular-nums">{(match.wager_points * 1.8).toFixed(0)}</span>
            </div>
         </div>
      </div>

      <button className="w-full flex items-center justify-center gap-3 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] hover:text-white hover:bg-white/[0.03] transition-all border-t border-white/5 -mb-2">
         ANALYZE MATCH <ArrowRight size={14} />
      </button>
    </motion.div>
  );
}
