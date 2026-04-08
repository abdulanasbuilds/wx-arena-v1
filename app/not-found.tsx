'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import { Home, RefreshCcw, AlertCircle, Terminal, ShieldAlert } from "lucide-react"

export default function NotFound() {
  return (
    <div className="relative flex bg-[#050508] min-h-screen flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* Cinematic Background Glitch Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Error HUD */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 glass-pro p-12 rounded-[2.5rem] border-white/5 max-w-2xl w-full shadow-2xl"
      >
        {/* Border HUD Accents */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-primary/40 rounded-tl-[2.5rem]" />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-primary/40 rounded-br-[2.5rem]" />

        <div className="flex justify-center mb-8">
          <div className="relative">
            <ShieldAlert size={80} className="text-primary/20 animate-pulse" />
            <AlertCircle size={40} className="text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>

        <h2 className="text-8xl font-black text-white mb-2 tracking-tighter" style={{ fontFamily: 'var(--font-syne)' }}>
          404
        </h2>
        <h1 className="text-2xl font-black text-white/90 mb-4 tracking-tight uppercase italic underline decoration-primary/50 underline-offset-8">
          SIGNAL LOST.
        </h1>
        
        <p className="text-[#64748b] mb-10 text-lg leading-relaxed max-w-md mx-auto">
          The coordinates you've entered seem to be out of our global range. Return to the main arena to resume competition.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="btn-primary w-full sm:w-auto px-10 py-4 text-base font-black tracking-widest uppercase">
            <Home size={18} />
            Return Home
          </Link>
          <button 
            onClick={() => window.location.reload()}
            className="btn-secondary w-full sm:w-auto px-10 py-4 text-base font-black tracking-widest uppercase border-white/10 hover:bg-white/10"
          >
            <RefreshCcw size={18} />
            Re-Sync Signal
          </button>
        </div>

        {/* Footer HUD Text */}
        <div className="mt-12 flex items-center justify-center gap-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
           <span className="flex items-center gap-2"><Terminal size={12}/> STATUS: OFFLINE</span>
           <span className="flex items-center gap-2"><Globe2 size={12}/> NODE: GLOBAL_HQ_01</span>
        </div>
      </motion.div>

      {/* Floating Decorative Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 border border-white/5 rounded-full animate-float opacity-20" />
      <div className="absolute bottom-20 right-20 w-48 h-48 border border-white/5 rounded-full animate-float opacity-10" style={{ animationDelay: '2s' }} />
    </div>
  )
}

function Globe2({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
}
