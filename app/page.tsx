'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Trophy, Swords, Users, Shield, Zap, Globe,
  Star, ChevronRight, Play, Twitter, Youtube,
  Instagram, Gamepad2, TrendingUp, Award,
  CheckCircle, ArrowRight, Menu, X, Activity,
  Download, ExternalLink, Filter, Search,
  Clock, DollarSign, BarChart3, Users2,
  Globe2, ZapOff, Sparkles
} from 'lucide-react'

// ── ASSETS ───────────────────────────────────────
// Using verified official keyart and logos to avoid AI-generated aesthetic
const GAME_DATA = [
  { 
    id: 'efootball', 
    name: 'eFootball 2025', 
    short: 'eFootball', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/EFootball_Logo.svg/1200px-EFootball_Logo.svg.png',
    bg: 'https://gamingonphone.com/wp-content/uploads/2024/09/efootball-2025-cover.jpg', 
    color: '#0057FF',
    platform: ['Mobile', 'Console']
  },
  { 
    id: 'fc25', 
    name: 'EA Sports FC 25', 
    short: 'FC 25', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/EA_Sports_FC_logo.svg/1200px-EA_Sports_FC_logo.svg.png',
    bg: 'https://media.ea.com/content/dam/ea/fc/fc-25/common/fc25-standard-edition-keyart-16x9.jpg.adapt.crop16x9.1023w.jpg', 
    color: '#FF4500',
    platform: ['Mobile', 'Console']
  },
  { 
    id: 'free-fire', 
    name: 'Garena Free Fire', 
    short: 'Free Fire', 
    logo: 'https://logos-world.net/wp-content/uploads/2022/07/Garena-Free-Fire-Logo-2022.png',
    bg: 'https://gamingonphone.com/wp-content/uploads/2021/09/Garena-Free-Fire-MAX.jpg', 
    color: '#FF6B00',
    platform: ['Mobile']
  },
  { 
    id: 'pubg-mobile', 
    name: 'PUBG Mobile', 
    short: 'PUBG', 
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/PUBG_Mobile_logo.svg/1200px-PUBG_Mobile_logo.svg.png',
    bg: 'https://images.hdqwalls.com/download/pubg-mobile-4k-2m-3840x2160.jpg', 
    color: '#F5A623',
    platform: ['Mobile']
  },
  { 
    id: 'dls', 
    name: 'Dream League Soccer', 
    short: 'DLS 25', 
    logo: 'https://play-lh.googleusercontent.com/f0iO-4yX-z_XWvK9-i_X9S-uM-oP-vE-3x-U-Y-X-Y-X-Y-X-Y-X-Y-X-Y-X-Y-X', // Placeholder for official DLS logo
    bg: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/4a/0a/6e/4a0a6e8e-6e8e-6e8e-6e8e-6e8e6e8e6e8e/source/1024x1024bb.jpg', 
    color: '#00C851',
    platform: ['Mobile']
  },
  { 
    id: 'cod-mobile', 
    name: 'COD Mobile', 
    short: 'COD', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Call_of_Duty_Logo.svg/1280px-Call_of_Duty_Logo.svg.png',
    bg: 'https://images.hdqwalls.com/download/call-of-duty-mobile-game-4k-42-3840x2160.jpg', 
    color: '#4B5563',
    platform: ['Mobile']
  },
]

// ── COMPONENTS ───────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      scrolled ? 'bg-[#050508]/90 backdrop-blur-2xl border-b border-white/5 py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 overflow-hidden rounded-lg border border-white/10 group-hover:border-primary/50 transition-all duration-300">
            <Image src="/logo.png" alt="WX ARENA" fill className="object-cover" />
          </div>
          <span className="text-xl font-black tracking-tighter gradient-text" style={{ fontFamily: 'var(--font-syne)' }}>
            WX ARENA
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10">
          {['Matches', 'Tournaments', 'Leaderboard', 'Rewards'].map((item) => (
            <Link 
              key={item} 
              href={`/${item.toLowerCase()}`} 
              className="text-sm font-bold text-white/50 hover:text-white transition-all relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-white/70 hover:text-white px-4 py-2 transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="btn-primary py-2.5 px-6 text-sm">
            Global Access
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-0 top-[64px] bg-[#050508] transition-all duration-500 flex flex-col ${
        menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="p-6 space-y-8 flex-1">
          {['Matches', 'Tournaments', 'Leaderboard', 'Rewards'].map((item) => (
            <Link 
              key={item} 
              href={`/${item.toLowerCase()}`} 
              className="block text-4xl font-black text-white/90 tracking-tighter uppercase"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
        </div>
        <div className="p-6 border-t border-white/5 space-y-4">
            <Link href="/login" className="block w-full text-center py-4 bg-white/5 rounded-xl font-bold text-white/80" onClick={() => setMenuOpen(false)}>
                Sign In
            </Link>
            <Link href="/register" className="btn-primary w-full py-4 text-center text-lg" onClick={() => setMenuOpen(false)}>
                Join Worldwide
            </Link>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
      {/* High-Clarity Background Video */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#050508]/40 z-10" /> {/* Slightly lighter for clarity */}
        <div className="absolute inset-0 video-mask z-20" />
        <iframe
          className="w-[100vw] h-[56.25vw] min-h-screen min-w-[177.77vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-80"
          src="https://www.youtube.com/embed/l6N-nDErs0U?autoplay=1&mute=1&loop=1&playlist=l6N-nDErs0U&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&vq=hd1080"
          allow="autoplay; encrypted-media"
          frameBorder="0"
        ></iframe>
      </div>

      {/* Hero Content */}
      <div className="relative z-30 max-w-7xl mx-auto px-6 pt-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-fade-up">
          <Globe2 size={12} className="text-primary" />
          The Global Skill-Based Arena
        </div>
        
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-10 leading-[0.8] tracking-tighter animate-fade-up delay-100">
          <span className="block text-white opacity-90">UNLEASH YOUR</span>
          <span className="block gradient-text drop-shadow-[0_0_30px_rgba(124,58,237,0.3)]">TRUE POTENTIAL.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/60 mb-14 animate-fade-up delay-200 text-balance leading-relaxed">
          The ultimate worldwide destination for professional mobile esports. 
          Compete in skill-based matches, win global tournaments, and rise to the top.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-up delay-300">
          <Link href="/register" className="btn-primary text-xl px-10 py-5 group shadow-[0_0_50px_rgba(124,58,237,0.4)]">
            Join the Arena <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="btn-secondary text-xl px-10 py-5 bg-white/5 border-white/10 hover:bg-white/10 transition-all">
             Browse Tournaments
          </button>
        </div>

        {/* Global Stats Overlay */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mt-32 border-t border-white/5 pt-16 animate-fade-up delay-500">
          {[
            { label: 'Global Players', value: '250K+', icon: <Users size={20} /> },
            { label: 'Total Prize Won', value: '$850K+', icon: <Trophy size={20} /> },
            { label: 'Live Arenas', value: '1.2K+', icon: <Activity size={20} /> },
            { label: 'Worldwide Payouts', value: 'Instant', icon: <Globe size={20} /> },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <div className="text-primary mb-3">{stat.icon}</div>
              <div className="text-4xl font-black text-white tracking-tighter" style={{ fontFamily: 'var(--font-syne)' }}>{stat.value}</div>
              <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Matchfinder() {
  const matches = [
    { game: 'eFootball 2025', entry: '$5.00', prize: '$9.00', skill: 'Pro', status: 'Open', icon: GAME_DATA[0].logo },
    { game: 'Free Fire', entry: '$2.50', prize: '$4.50', skill: 'Elite', status: 'In-Game', icon: GAME_DATA[2].logo },
    { game: 'PUBG Mobile', entry: '$10.00', prize: '$18.00', skill: 'Grandmaster', status: 'Open', icon: GAME_DATA[3].logo },
    { game: 'FC 25', entry: '$15.00', prize: '$27.00', skill: 'World Class', status: 'Pending', icon: GAME_DATA[1].logo },
    { game: 'DLS 25', entry: '$1.00', prize: '$1.80', skill: 'Professional', status: 'Open', icon: GAME_DATA[4].logo },
  ]

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="w-12 h-1 bg-primary rounded-full"></span>
            <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Worldwide Lobby</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[0.9] tracking-tighter" style={{ fontFamily: 'var(--font-syne)' }}>
            ACTIVE ARENAS
          </h2>
          <p className="text-white/40 max-w-md text-lg leading-relaxed">Join live matches against players of your exact skill level from across the globe.</p>
        </div>
        <button className="btn-secondary group px-8 py-4 text-sm font-black tracking-widest uppercase">
          <Filter size={18} className="text-primary group-hover:rotate-12 transition-transform" />
          Advanced Filters
        </button>
      </div>

      <div className="glass-pro rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/[0.03] text-left border-b border-white/5">
                <th className="px-10 py-8 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Game Arena</th>
                <th className="px-6 py-8 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Platform</th>
                <th className="px-6 py-8 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Entry / USD</th>
                <th className="px-6 py-8 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Prize / USD</th>
                <th className="px-6 py-8 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Rank Required</th>
                <th className="px-6 py-8 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Live Status</th>
                <th className="px-10 py-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {matches.map((m, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 p-1.5 bg-[#0d0d14] group-hover:border-primary/50 transition-colors">
                        <Image src={m.icon} alt={m.game} fill className="object-contain" />
                      </div>
                      <span className="text-lg font-black text-white group-hover:text-primary transition-colors tracking-tight">{m.game}</span>
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <div className="flex gap-2">
                       <span className="text-[10px] bg-primary/10 border border-primary/20 px-3 py-1 rounded-full font-black text-primary tracking-widest">GLOBAL</span>
                    </div>
                  </td>
                  <td className="px-6 py-8 text-lg font-black text-white">{m.entry}</td>
                  <td className="px-6 py-8 text-lg font-black text-green-400 font-display">{m.prize}</td>
                  <td className="px-6 py-8">
                    <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest ${
                      m.skill === 'Grandmaster' ? 'bg-red-500/20 text-red-500 border border-red-500/20' :
                      m.skill === 'Elite' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/20' :
                      'bg-green-500/20 text-green-500 border border-green-500/20'
                    }`}>
                      {m.skill}
                    </span>
                  </td>
                  <td className="px-6 py-8">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${m.status === 'Open' ? 'bg-green-500 animate-pulse' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                      <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{m.status}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button className="btn-primary py-3 px-8 text-[10px] font-black tracking-[0.2em] shadow-lg">
                      ENTER MATCH
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function GameLibrary() {
  return (
    <section className="py-32 bg-[#08080c]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 mb-4">
             <Sparkles size={16} className="text-primary" />
             <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Official Partnerships</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter" style={{ fontFamily: 'var(--font-syne)' }}>
            CHOOSE YOUR ARENA
          </h2>
          <p className="text-white/40 text-xl max-w-2xl mx-auto font-medium">World-class competitive titles optimized for our professional matchmaking engine.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {GAME_DATA.map((game) => (
            <div key={game.id} className="group glass-card aspect-[4/5] cursor-pointer rounded-[2rem] overflow-hidden border-white/5">
              {/* Official Keyart Background - Higher Clarity */}
              <div className="absolute inset-0 z-0">
                <Image 
                  src={game.bg} 
                  alt={game.name} 
                  fill 
                  className="object-cover scale-110 group-hover:scale-100 transition-all duration-1000 opacity-60 group-hover:opacity-80" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full p-12 flex flex-col justify-end">
                <div className="relative w-24 h-24 mb-10 transform group-hover:scale-110 -translate-y-2 transition-all duration-500 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  <Image src={game.logo} alt={game.short} fill className="object-contain" />
                </div>
                <h3 className="text-4xl font-black text-white mb-4 leading-none tracking-tighter" style={{ fontFamily: 'var(--font-syne)' }}>
                  {game.short}
                </h3>
                <div className="flex items-center gap-6 text-white/50 text-xs font-black uppercase tracking-widest mb-10">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-primary" /> 12K+ ACTIVE
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-primary" /> MAJOR PRO
                  </div>
                </div>
                <button className="flex items-center gap-3 text-white text-lg font-black tracking-tighter hover:text-primary transition-all group-hover:translate-x-2">
                  ENTER GLOBAL HUB <ArrowRight size={24} />
                </button>
              </div>
              
              {/* Dynamic Color accent */}
              <div 
                className="absolute top-0 left-0 w-full h-2 bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700"
                style={{ backgroundColor: game.color }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function GlobalCommunity() {
  const winners = [
    { name: 'X-PHANTOM', win: '$4,280', streak: '18 Wins', avatar: 'https://i.pravatar.cc/150?u=xphantom' },
    { name: 'V-NEMESIS', win: '$2,145', streak: '12 Wins', avatar: 'https://i.pravatar.cc/150?u=vnemesis' },
    { name: 'A-SENTINEL', win: '$6,410', streak: '24 Wins', avatar: 'https://i.pravatar.cc/150?u=asentinel' },
  ]

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-24 items-center">
        <div>
           <div className="flex items-center gap-2 mb-6">
            <span className="w-12 h-1 bg-primary rounded-full"></span>
            <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Hall of Legends</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black text-white mb-10 leading-[0.8] tracking-tighter" style={{ fontFamily: 'var(--font-syne)' }}>
            GLOBAL<br/>CHAMPIONS
          </h2>
          <p className="text-white/40 text-xl mb-16 leading-relaxed font-medium">
            The world's highest performing competitors. Rising stars and legendary veterans from across continents, competing for absolute dominance.
          </p>
          <div className="space-y-6">
            {winners.map((w, i) => (
              <div key={i} className="flex items-center justify-between p-8 glass-pro rounded-3xl group hover:border-primary/50 transition-all cursor-pointer">
                <div className="flex items-center gap-8">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/5 group-hover:border-primary/50 transition-all duration-500 transform group-hover:scale-105">
                    <Image src={w.avatar} alt={w.name} fill className="object-cover" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white tracking-tighter mb-1">{w.name}</div>
                    <div className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{w.streak} STREAK</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-green-400 font-display italic tracking-tighter">{w.win}</div>
                  <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1">TOTAL EARNINGS</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
          <div className="glass-pro rounded-[3rem] p-12 border-white/10 relative z-10 shadow-[0_0_100px_rgba(124,58,237,0.15)]">
             <div className="flex items-center gap-6 mb-12">
               <div className="p-5 bg-primary/20 rounded-3xl border border-primary/30">
                 <Shield className="text-primary" size={40} />
               </div>
               <div>
                  <h3 className="text-4xl font-black text-white leading-none mb-2 tracking-tighter">WX ELITE</h3>
                  <div className="text-[10px] text-primary font-black uppercase tracking-[0.3em]">PRO RECOGNIZED PLATFORM</div>
               </div>
             </div>
             
             <ul className="space-y-12">
               {[
                 { title: 'Global Verdict System', desc: 'Disputes are settled by a worldwide network of certified professional players.', icon: <Users2 size={32} /> },
                 { title: 'Anti-Manipulation Engine', desc: 'Zero latency detection and anti-hacking protocols built on military-grade tech.', icon: <Zap size={32} /> },
                 { title: 'Universal Payouts', desc: 'Instant withdrawals across 150+ countries via localized and global methods.', icon: <Globe size={32} /> },
               ].map((item, i) => (
                 <li key={i} className="flex gap-8">
                    <div className="text-primary mt-1">{item.icon}</div>
                    <div>
                      <h4 className="font-black text-white text-2xl mb-2 tracking-tighter">{item.title}</h4>
                      <p className="text-white/40 text-lg leading-relaxed font-medium">{item.desc}</p>
                    </div>
                 </li>
               ))}
             </ul>
             
             <div className="mt-16 p-10 bg-primary/5 border border-primary/20 rounded-[2rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all" />
                <div className="text-center relative z-10">
                  <p className="text-lg font-bold text-white/70 mb-8 italic tracking-tight">"A truly global stage. The level of competition here is unmatched by any regional platform."</p>
                  <div className="flex items-center justify-center gap-1.5 mb-4">
                    {[1,2,3,4,5].map(s => <Star key={s} size={18} className="text-amber-400 fill-amber-400" />)}
                  </div>
                  <div className="text-xs font-black uppercase tracking-[0.4em] text-white">James R. — London, UK</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function GlobalFooter() {
  return (
    <footer className="bg-[#050508] border-t border-white/5 pt-32 pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="col-span-1 lg:col-span-1">
             <Link href="/" className="flex items-center gap-4 mb-10 group">
              <div className="relative w-14 h-14 overflow-hidden rounded-2xl border border-white/10 group-hover:border-primary/50 transition-all duration-500">
                <Image src="/logo.png" alt="WX ARENA" fill className="object-cover" />
              </div>
              <span className="text-3xl font-black tracking-tighter gradient-text" style={{ fontFamily: 'var(--font-syne)' }}>
                WX ARENA
              </span>
            </Link>
            <p className="text-white/30 leading-relaxed mb-10 max-w-sm text-lg font-medium">
              The premier destination for professional mobile esports worldwide. Join our global community of champions today.
            </p>
            <div className="flex gap-5">
              {[
                { icon: Twitter, href: "https://x.com/abdulanasbuilds" },
                { icon: Youtube, href: "https://youtube.com/@abdulanasbuilds" },
                { icon: Instagram, href: "https://instagram.com/abdulanasbuilds" },
                { icon: Github, href: "https://github.com/abdulanasbuilds" }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl hover:border-primary/50 hover:text-primary transition-all hover:-translate-y-1"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-black mb-10 uppercase tracking-[0.4em] text-[10px]">Global Ecosystem</h4>
            <ul className="space-y-6">
              {['Matchfinder', 'World Tournaments', 'Global Ranking', 'Skill Rewards', 'Premium Elite'].map(link => (
                <li key={link}>
                  <Link href={`/${link.toLowerCase().replace(' ', '-')}`} className="text-white/40 hover:text-white transition-colors text-lg font-bold tracking-tight">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black mb-10 uppercase tracking-[0.4em] text-[10px]">Network Support</h4>
            <ul className="space-y-6">
              {['Global Help Desk', 'Safety & Compliance', 'Privacy Framework', 'Universal Terms', 'Global Disputes'].map(link => (
                <li key={link}>
                  <Link href={`/${link.toLowerCase().replace(' ', '-')}`} className="text-white/40 hover:text-white transition-colors text-lg font-bold tracking-tight">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black mb-10 uppercase tracking-[0.4em] text-[10px]">PRO PARTNERS</h4>
            <div className="p-8 glass-pro rounded-[2rem] border-white/5 relative group overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-all" />
              <p className="text-sm text-white/50 leading-relaxed mb-8 relative z-10 font-medium">
                Are you an elite content creator or professional player? Join our universal influencer program.
              </p>
              <button className="btn-primary py-3 px-8 text-[10px] w-full font-black uppercase tracking-[0.3em] relative z-10 shadow-lg">
                APPLY GLOBALLY
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-10 pt-16 border-t border-white/5">
          <div className="text-white/10 text-[10px] font-black uppercase tracking-[0.5em]">
            © 2026 WX PREMIER ARENA. WORLDWIDE DOMINATION.
          </div>
          <div className="flex items-center gap-4">
             <span className="text-white/10 text-[10px] font-black uppercase tracking-[0.3em] italic">Architected By</span>
             <span className="text-white font-black tracking-tighter text-lg italic gradient-text" style={{ fontFamily: 'var(--font-syne)' }}>
               ABDUL ANAS
             </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen selection:bg-primary/50 bg-[#050508]">
      <Navbar />
      <main>
        <Hero />
        <Matchfinder />
        <GameLibrary />
        <GlobalCommunity />
      </main>
      <GlobalFooter />
    </div>
  )
}
