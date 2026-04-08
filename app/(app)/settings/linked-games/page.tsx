"use client";

import { useState, useEffect } from "react";
import { Gamepad2, Plus, ExternalLink, ShieldCheck, Zap, Globe, AlertCircle, RefreshCcw, CheckCircle2, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Official Game Metadata for Linking
const LINKABLE_GAMES = [
  { id: 'efootball', name: 'eFootball 2025', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/EFootball_Logo.svg/1200px-EFootball_Logo.svg.png' },
  { id: 'fc25', name: 'EA Sports FC 25', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/EA_Sports_FC_logo.svg/1200px-EA_Sports_FC_logo.svg.png' },
  { id: 'free-fire', name: 'Free Fire', logo: 'https://logos-world.net/wp-content/uploads/2022/07/Garena-Free-Fire-Logo-2022.png' },
  { id: 'pubg-mobile', name: 'PUBG Mobile', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/PUBG_Mobile_logo.svg/1200px-PUBG_Mobile_logo.svg.png' },
  { id: 'cod', name: 'COD Mobile', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Call_of_Duty_Logo.svg/1280px-Call_of_Duty_Logo.svg.png' },
];

export default function LinkedGamesPage() {
  const [user, setUser] = useState<any>(null);
  const [linkedGames, setLinkedGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedGame, setSelectedGame] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        fetchLinkedGames(user.id);
      } else {
        window.location.href = "/login";
      }
    });
  }, []);

  const fetchLinkedGames = async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase.from("linked_games").select("*").eq("user_id", userId);
    setLinkedGames(data || []);
    setLoading(false);
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 min-h-screen">
      {/* Header HUD */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-12 h-1 bg-primary rounded-full" />
            <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em]">Account Integration</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter" style={{ fontFamily: 'var(--font-syne)' }}>
            CONNECTED <br/> <span className="gradient-text">ARENAS.</span>
          </h1>
          <p className="text-[#64748b] text-lg max-w-md font-medium leading-relaxed">
            Verify your worldwide gaming identities to track performance and join professional ladders.
          </p>
        </div>
        
        <Button 
          variant="primary" 
          onClick={() => setIsLinking(true)}
          className="py-5 px-10 text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/20 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          Link New Identity
        </Button>
      </div>

      {/* Connection Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {linkedGames.length > 0 ? (
          linkedGames.map((game, i) => (
            <motion.div 
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group glass-pro p-8 rounded-[2rem] border-white/5 relative overflow-hidden hover:border-primary/40 transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl -mr-12 -mt-12 group-hover:bg-primary/20 transition-all" />
              
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#0d0d14] border border-white/10 flex items-center justify-center p-2.5 shadow-xl group-hover:border-primary/30 transition-all">
                  <Gamepad2 className="text-primary" size={24} />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Verified</span>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white tracking-tighter mb-1" style={{ fontFamily: 'var(--font-syne)' }}>
                  {game.display_name.toUpperCase()}
                </h3>
                 <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mb-8">
                  {game.game_id} • GLOBAL SERVERS
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                 <div className="flex items-center gap-2">
                    <RefreshCcw size={12} className="text-[#64748b]" />
                    <span className="text-[10px] text-[#64748b] font-bold uppercase tracking-widest">Last Sync: Today</span>
                 </div>
                 <button className="text-white/20 hover:text-white transition-colors">
                    <ExternalLink size={18} />
                 </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="lg:col-span-3 py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem] text-center space-y-6">
             <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/20">
                <ShieldCheck size={40} />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-black text-white/40 tracking-tighter uppercase" style={{ fontFamily: 'var(--font-syne)' }}>No identities linked.</h3>
                <p className="text-sm text-white/20 max-w-xs mx-auto font-medium">Connect your accounts to start building your professional global reputation.</p>
             </div>
             <Button variant="ghost" onClick={() => setIsLinking(true)} className="text-primary hover:text-primary/80 uppercase tracking-widest text-[10px] font-black">
               Initialize First Connection <ChevronRight size={14} />
             </Button>
          </div>
        )}
      </div>

      {/* Linking Modal (Premium HUD Wizard) */}
      <AnimatePresence>
        {isLinking && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-12">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-[#050508]/95 backdrop-blur-2xl" 
               onClick={() => setIsLinking(false)} 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl glass-pro rounded-[3rem] border-white/5 overflow-hidden shadow-[0_0_100px_rgba(124,58,237,0.2)]"
            >
               {/* Wizard Progress HUD */}
               <div className="absolute top-0 left-0 right-0 h-1.5 flex gap-1">
                  {[1,2,3].map(i => (
                    <div key={i} className={cn("flex-1 transition-all duration-500", i <= step ? "bg-primary" : "bg-white/5")} />
                  ))}
               </div>

               <div className="p-12 sm:p-20">
                  <button 
                    onClick={() => setIsLinking(false)}
                    className="absolute top-10 right-10 text-white/20 hover:text-white transition-colors"
                  >
                    CLOSE [ESC]
                  </button>

                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div 
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-12"
                      >
                         <div className="space-y-4 text-center sm:text-left">
                            <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em]">Step 01 / 03</span>
                            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: 'var(--font-syne)' }}>
                              SELECT <span className="gradient-text">ARENA.</span>
                            </h2>
                            <p className="text-white/40 text-lg font-medium">Choose the title you wish to integrate with your global WX profile.</p>
                         </div>

                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            {LINKABLE_GAMES.map(game => (
                              <button 
                                key={game.id}
                                onClick={() => { setSelectedGame(game); setStep(2); }}
                                className="group flex flex-col items-center gap-6 p-8 glass-pro rounded-3xl border-white/5 hover:border-primary/40 hover:bg-white/[0.03] transition-all"
                              >
                                 <div className="relative w-16 h-16 grayscale group-hover:grayscale-0 transition-all transform group-hover:scale-110">
                                    <Image src={game.logo} alt={game.name} fill className="object-contain" />
                                 </div>
                                 <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] group-hover:text-white transition-colors">{game.name}</span>
                              </button>
                            ))}
                         </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                       <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-12"
                      >
                         <div className="space-y-4">
                            <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em]">Step 02 / 03</span>
                            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: 'var(--font-syne)' }}>
                               IDENTITY <span className="gradient-text">LINK.</span>
                            </h2>
                            <p className="text-white/40 text-lg font-medium">Enter your official {selectedGame?.name} Player ID / Username.</p>
                         </div>

                         <div className="space-y-8">
                            <div className="relative group">
                               <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left" />
                               <input 
                                 autoFocus
                                 placeholder="GAME ID (e.g. Player#1234)"
                                 className="w-full bg-transparent border-b border-white/10 py-6 text-2xl sm:text-4xl font-black text-white uppercase tracking-tighter placeholder:text-white/10 outline-none"
                               />
                            </div>
                            
                            <div className="flex items-start gap-4 p-6 bg-primary/5 border border-primary/20 rounded-2xl">
                               <AlertCircle size={20} className="text-primary shrink-0" />
                               <p className="text-xs text-primary/60 font-bold uppercase tracking-widest leading-relaxed">
                                 Verification takes 2-4 hours. Our global engine will analyze your game history for legitimacy.
                               </p>
                            </div>
                         </div>

                         <div className="flex gap-4">
                            <button onClick={() => setStep(1)} className="px-10 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">BACK</button>
                            <Button variant="primary" onClick={() => setStep(3)} className="flex-1 py-5 text-xs font-black uppercase tracking-widest">VALIDATE IDENTITY</Button>
                         </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                       <motion.div 
                        key="step3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center py-10 space-y-10"
                      >
                         <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                            <CheckCircle2 size={48} className="text-green-500" />
                         </div>
                         <div className="space-y-4">
                            <h2 className="text-4xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: 'var(--font-syne)' }}>SIGNAL RECEIVED.</h2>
                            <p className="text-white/40 max-w-sm mx-auto font-medium">Your identity is being processed by the global grid. You will receive a notification once verified.</p>
                         </div>
                         <Button variant="primary" onClick={() => setIsLinking(false)} className="px-20 py-5 text-xs font-black uppercase tracking-widest">RESUME ARENA</Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Trust HUD */}
      <div className="pt-20 border-t border-white/5">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            {[
              { title: 'UNIVERSAL SYNC', desc: 'Single identity across all professional mobile titles.', icon: <Globe size={24}/> },
              { title: 'ANTI-CHEAT GRID', desc: 'Continuous legitimacy monitoring via official APIs.', icon: <Zap size={24}/> },
              { title: 'PRO LEGACY', desc: 'Build an immutable history of your competitive wins.', icon: <ShieldCheck size={24}/> },
            ].map((f, i) => (
              <div key={i} className="space-y-4">
                 <div className="text-primary">{f.icon}</div>
                 <h4 className="text-lg font-black text-white tracking-tight uppercase" style={{ fontFamily: 'var(--font-syne)' }}>{f.title}</h4>
                 <p className="text-[#64748b] text-sm leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
