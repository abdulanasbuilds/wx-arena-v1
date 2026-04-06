"use client";

import { useState } from "react";
import { X, Swords, Trophy, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface Opponent {
  id: string;
  username: string;
  avatar_url?: string;
  rank: number;
  win_rate: number;
  total_matches: number;
}

interface MatchFoundModalProps {
  isOpen: boolean;
  opponent: Opponent | null;
  gameName: string;
  wagerPoints: number;
  onAccept: () => void;
  onDecline: () => void;
  countdown?: number;
}

export function MatchFoundModal({
  isOpen,
  opponent,
  gameName,
  wagerPoints,
  onAccept,
  onDecline,
  countdown = 10,
}: MatchFoundModalProps) {
  const [timeLeft, setTimeLeft] = useState(countdown);

  // Countdown timer effect would go here
  // Auto-decline when timer reaches 0

  if (!isOpen || !opponent) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#0d0d14] border border-[#a855f7]/50 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl shadow-[#a855f7]/20"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#a855f7]/20 mb-2">
              <Swords className="w-8 h-8 text-[#a855f7]" />
            </div>
            <h2 className="text-2xl font-bold text-[#f1f5f9]">Match Found!</h2>
            <p className="text-[#64748b]">
              {gameName} • {wagerPoints} points
            </p>
          </div>

          {/* VS Display */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a855f7] to-[#f59e0b] flex items-center justify-center text-white font-bold text-xl">
                You
              </div>
              <p className="text-xs text-[#64748b] mt-1">You</p>
            </div>

            <div className="text-center px-4">
              <span className="text-3xl font-bold text-[#a855f7]">VS</span>
            </div>

            <div className="text-center">
              <Avatar
                username={opponent.username}
                size="xl"
                src={opponent.avatar_url}
              />
              <p className="text-xs text-[#64748b] mt-1 truncate max-w-[80px]">
                {opponent.username}
              </p>
            </div>
          </div>

          {/* Opponent Stats */}
          <div className="bg-[#1a1a2e] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748b]">Rank</span>
              <Badge variant="default">#{opponent.rank}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748b]">Win Rate</span>
              <span className="text-sm font-medium text-[#f1f5f9]">
                {opponent.win_rate.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748b]">Total Matches</span>
              <span className="text-sm font-medium text-[#f1f5f9]">
                {opponent.total_matches || 0}
              </span>
            </div>
          </div>

          {/* Countdown */}
          <div className="text-center">
            <p className="text-sm text-[#64748b]">Match expires in</p>
            <p className="text-2xl font-bold text-[#f59e0b]">{timeLeft}s</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={onDecline}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Decline
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={onAccept}
              className="flex-1 gap-2"
            >
              <Swords className="w-4 h-4" />
              Accept
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
