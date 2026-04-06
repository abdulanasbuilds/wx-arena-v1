"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Zap, Trophy, Users, Play } from "lucide-react";
import { useState, useRef } from "react";

// COD/PUBG style gameplay video URL (using a gaming montage)
const HERO_VIDEO_URL = "https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-network-connections-27611-large.mp3";

export function Hero() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="/images/hero-poster.jpg"
        >
          <source src="https://cdn.pixabay.com/video/2020/05/25/40130-424930032_large.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/90 via-[#050508]/70 to-[#050508]/95" />
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#a855f7]/10 via-transparent to-[#f59e0b]/10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24 w-full">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#a855f7]/20 border border-[#a855f7]/40 backdrop-blur-sm mb-8"
          >
            <Zap className="w-4 h-4 text-[#a855f7]" />
            <span className="text-sm font-medium text-[#a855f7]">
              Africa&apos;s #1 Skill Gaming Platform
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            <span className="block text-[#f1f5f9]">Compete. Win.</span>
            <span className="block gradient-text mt-2">Earn Rewards.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-[#94a3b8] max-w-2xl mx-auto mb-10"
          >
            Join the ultimate skill-based gaming arena. Play eFootball, League of Legends, 
            COD, Fortnite & more. Compete in tournaments, climb leaderboards, 
            and win real prizes.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register">
              <Button variant="primary" size="lg" className="group">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <button onClick={toggleVideo} className="flex items-center gap-2 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#a855f7]/20 border border-[#a855f7]/40 flex items-center justify-center">
                <Play className="w-5 h-5 text-[#a855f7]" />
              </div>
              <span className="text-sm font-medium">Watch Gameplay</span>
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="w-4 h-4 text-[#a855f7]" />
                <span className="text-2xl sm:text-3xl font-bold text-[#f1f5f9]">50K+</span>
              </div>
              <span className="text-xs sm:text-sm text-[#64748b]">Active Players</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="w-4 h-4 text-[#f59e0b]" />
                <span className="text-2xl sm:text-3xl font-bold text-[#f1f5f9]">₦2M+</span>
              </div>
              <span className="text-xs sm:text-sm text-[#64748b]">Prizes Won</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-4 h-4 text-[#22c55e]" />
                <span className="text-2xl sm:text-3xl font-bold text-[#f1f5f9]">10K+</span>
              </div>
              <span className="text-xs sm:text-sm text-[#64748b]">Daily Matches</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
