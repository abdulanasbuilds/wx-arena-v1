"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Menu, X, Bell, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationsDropdown } from "@/components/features/NotificationsDropdown";

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Matches", href: "/matches" },
  { label: "Tournaments", href: "/tournaments" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Rewards", href: "/rewards" },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
      scrolled || isMobileMenuOpen
        ? "bg-[#050508]/80 backdrop-blur-2xl border-b border-white/5 py-3"
        : "bg-transparent py-5"
    )}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 overflow-hidden rounded-lg border border-white/10 group-hover:border-primary/50 transition-colors">
            <Image src="/logo.png" alt="WX ARENA" fill className="object-cover" />
          </div>
          <span className="text-xl font-black tracking-tighter gradient-text" style={{ fontFamily: 'var(--font-syne)' }}>
            WX ARENA
          </span>
        </Link>
        
        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-sm font-medium transition-all duration-200 relative group",
                  isActive ? "text-white" : "text-white/60 hover:text-white"
                )}
              >
                {label}
                <span className={cn(
                  "absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300",
                  isActive ? "w-full" : "w-0 group-hover:w-full"
                )} />
              </Link>
            );
          })}
        </div>
        
        {/* Notifications & Profile */}
        <div className="hidden lg:flex items-center gap-4">
          <NotificationsDropdown />
          <div className="h-8 w-px bg-white/10 mx-2" />
          <Link href="/login" className="text-sm font-semibold text-white/80 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="btn-primary py-2 px-6 text-sm">
            Join Now
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg text-white/60 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-0 top-[64px] bg-[#050508] z-50 overflow-y-auto"
          >
            <div className="p-6 space-y-8">
              <div className="space-y-4">
                {NAV_LINKS.map(({ label, href }) => {
                  const isActive = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeMobileMenu}
                      className={cn(
                        "block text-3xl font-black transition-colors uppercase tracking-tighter",
                        isActive ? "text-primary" : "text-white/40 hover:text-white"
                      )}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
              
              <div className="pt-8 border-t border-white/5 space-y-4">
                <Link 
                  href="/login" 
                  className="block text-xl font-bold text-white/60"
                  onClick={closeMobileMenu}
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="btn-primary w-full py-4 text-xl"
                  onClick={closeMobileMenu}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
