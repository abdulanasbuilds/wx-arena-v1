"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { GAMES } from "@/lib/utils/constants";

type Game = (typeof GAMES)[number];

interface GameCardProps {
  game: Game;
  onClick?: () => void;
  isSelected?: boolean;
}

export function GameCard({ game, onClick, isSelected = false }: GameCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "relative w-full text-left rounded-xl p-4 border transition-colors duration-200 cursor-pointer",
        "bg-[#1a1a2e] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7]",
        isSelected
          ? "border-[#a855f7] shadow-[0_0_16px_rgba(168,85,247,0.25)]"
          : "border-[#2a2a4e] hover:border-[#a855f7]/50",
      )}
      style={
        isSelected
          ? { borderColor: game.color, boxShadow: `0 0 20px ${game.color}30` }
          : undefined
      }
    >
      {/* Selected indicator stripe */}
      {isSelected && (
        <span
          className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl"
          style={{ background: game.color }}
        />
      )}

      {/* Emoji */}
      <span
        className="block mb-3 leading-none select-none"
        style={{ fontSize: "2.5rem" }}
        aria-hidden="true"
      >
        {game.emoji}
      </span>

      {/* Name */}
      <p
        className={cn(
          "font-semibold text-sm leading-tight mb-1 transition-colors",
          isSelected ? "text-[#f1f5f9]" : "text-[#f1f5f9]",
        )}
      >
        {game.name}
      </p>

      {/* Description */}
      <p className="text-xs text-[#94a3b8] leading-snug">{game.description}</p>

      {/* Color dot accent */}
      <span
        className="absolute top-3 right-3 w-2 h-2 rounded-full opacity-70"
        style={{ background: game.color }}
      />
    </motion.button>
  );
}
