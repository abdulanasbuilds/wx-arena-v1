import Link from "next/link";
import Image from "next/image";
import { Twitter, Youtube, Instagram, Github, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#050508] border-t border-white/5 pt-24 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 lg:col-span-1">
             <Link href="/" className="flex items-center gap-3 mb-8 group">
              <div className="relative w-12 h-12 overflow-hidden rounded-xl border border-white/10 group-hover:border-primary/50 transition-colors">
                <Image src="/logo.png" alt="WX ARENA" fill className="object-cover" />
              </div>
              <span className="text-2xl font-black tracking-tighter gradient-text" style={{ fontFamily: 'var(--font-syne)' }}>
                WX ARENA
              </span>
            </Link>
            <p className="text-white/40 leading-relaxed mb-8 max-w-sm">
              The premier worldwide destination for professional mobile esports. Built for performance. Dedicated to fair play.
            </p>
            <div className="flex gap-4">
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
                  className="p-3 bg-white/[0.03] border border-white/10 rounded-xl hover:border-primary/50 hover:text-primary transition-all group"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-[10px]">Platform</h4>
            <ul className="space-y-4">
              {['Matchfinder', 'Tournaments', 'Leaderboard', 'Rewards', 'Premium Elite'].map(link => (
                <li key={link}>
                  <Link href={`/${link.toLowerCase().replace(' ', '-')}`} className="text-white/40 hover:text-white transition-colors text-sm font-medium">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-[10px]">Support</h4>
            <ul className="space-y-4">
              {['Help Center', 'Safety & Rules', 'Privacy Policy', 'Terms of Service', 'Dispute System'].map(link => (
                <li key={link}>
                  <Link href={`/${link.toLowerCase().replace(' ', '-')}`} className="text-white/40 hover:text-white transition-colors text-sm font-medium">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-[10px]">WX CREATORS</h4>
            <div className="p-6 glass-pro rounded-2xl border-white/5 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-3xl -mr-12 -mt-12 group-hover:bg-primary/20 transition-all" />
              <p className="text-xs text-white/60 leading-relaxed mb-6 relative z-10">
                Are you a content creator or pro player? Join our influencer program and earn from your audience.
              </p>
              <button className="btn-primary py-2.5 px-6 text-[10px] w-full uppercase tracking-widest relative z-10">
                Learn More
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-12 border-t border-white/5">
          <div className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
            © 2026 WX ARENA PLATFORM. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-3">
             <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest italic">Designed & Engineered by</span>
             <span className="text-white font-black tracking-tighter text-sm italic" style={{ fontFamily: 'var(--font-syne)' }}>
               ABDUL ANAS
             </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
