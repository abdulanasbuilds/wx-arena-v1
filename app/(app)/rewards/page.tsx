"use client";

// NOTE: This page is intentionally a client component because the daily-claim
// button needs interactive state. Auth is checked via the Supabase browser
// client in a useEffect, matching the pattern used in chat/page.tsx.

import { useState, useEffect } from "react";
import {
  Flame,
  Play,
  Users,
  Trophy,
  CheckCircle,
  Lock,
  Zap,
  Copy,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils/cn";
import {
  AD_REWARD_POINTS,
  REFERRAL_REWARD_POINTS,
} from "@/lib/utils/constants";

// ─── Constants ────────────────────────────────────────────────────────────────

const USER_POINTS = 4200;
const DAILY_STREAK = 4;
const REFERRAL_CODE = "GHOST-4X7B";
const PROFILE_COMPLETE_REWARD = 50;

// Which of the 7 day tiles have been claimed (index 0 = Day 1)
// Days 0-3 claimed, day 3 = today (already claimed)
const CLAIMED_DAYS = [true, true, true, true, false, false, false];
const TODAY_INDEX = 3; // 0-based, so day 4

// ─── Types ────────────────────────────────────────────────────────────────────

interface EarnCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  reward: string;
  action: React.ReactNode;
}

interface RedeemItem {
  id: string;
  emoji: string;
  title: string;
  description: string;
  cost: number;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PointsChip({ points }: { points: number }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full",
        "bg-[#a855f7]/15 border border-[#a855f7]/30",
      )}
    >
      <Zap className="w-4 h-4 text-[#a855f7]" aria-hidden="true" />
      <span className="text-sm font-bold text-[#f1f5f9] tabular-nums">
        {points.toLocaleString()} WX Points
      </span>
    </div>
  );
}

// ── Daily streak card ────────────────────────────────────────────────────────

function DayTile({
  day,
  claimed,
  isToday,
}: {
  day: number;
  claimed: boolean;
  isToday: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 flex-1 min-w-0",
        "py-2.5 px-1 rounded-xl border transition-colors duration-200",
        isToday && claimed
          ? "bg-[#a855f7]/20 border-[#a855f7]/50"
          : isToday
            ? "bg-[#a855f7]/10 border-[#a855f7]/40"
            : claimed
              ? "bg-[#22c55e]/10 border-[#22c55e]/25"
              : "bg-[#16213e] border-[#2a2a4e]",
      )}
      aria-label={`Day ${day}${claimed ? " — claimed" : ""}${isToday ? " (today)" : ""}`}
    >
      <span
        className={cn("text-base leading-none", claimed ? "" : "opacity-30")}
        aria-hidden="true"
      >
        {claimed ? "🔥" : "·"}
      </span>
      <span
        className={cn(
          "text-[10px] font-semibold leading-none",
          isToday
            ? "text-[#a855f7]"
            : claimed
              ? "text-[#22c55e]"
              : "text-[#64748b]",
        )}
      >
        D{day}
      </span>
    </div>
  );
}

function StreakCard() {
  const [claimed, setClaimed] = useState(CLAIMED_DAYS[TODAY_INDEX] ?? false);
  const [claiming, setClaiming] = useState(false);

  const handleClaim = () => {
    if (claimed) return;
    setClaiming(true);
    setTimeout(() => {
      setClaiming(false);
      setClaimed(true);
    }, 1000);
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl",
              "bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-[#f59e0b]",
            )}
            aria-hidden="true"
          >
            <Flame className="w-5 h-5" />
          </span>
          <div>
            <p className="text-base font-bold text-[#f1f5f9] leading-tight">
              Daily Streak
            </p>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              {DAILY_STREAK}-day streak · keep it going!
            </p>
          </div>
        </div>

        <Badge variant="warning" size="md">
          🔥 {DAILY_STREAK} days
        </Badge>
      </div>

      {/* 7-day grid */}
      <div className="flex gap-1.5 mb-4" role="list" aria-label="Weekly streak">
        {CLAIMED_DAYS.map((wasClaimed, i) => {
          const isTodayTile = i === TODAY_INDEX;
          const effectiveClaimed = isTodayTile ? claimed : wasClaimed;
          return (
            <DayTile
              key={i}
              day={i + 1}
              claimed={effectiveClaimed}
              isToday={isTodayTile}
            />
          );
        })}
      </div>

      <Button
        variant={claimed ? "secondary" : "primary"}
        size="md"
        isLoading={claiming}
        disabled={claimed}
        onClick={handleClaim}
        className="w-full"
      >
        {claimed ? (
          <>
            <CheckCircle className="w-4 h-4" aria-hidden="true" />
            Claimed Today
          </>
        ) : (
          <>
            <Flame className="w-4 h-4" aria-hidden="true" />
            Claim Daily Bonus
          </>
        )}
      </Button>
    </Card>
  );
}

// ── Referral copy button ──────────────────────────────────────────────────────

function ReferralCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 mt-3">
      <div
        className={cn(
          "flex-1 px-3 py-2 rounded-lg",
          "bg-[#0d0d14] border border-[#2a2a4e]",
          "text-sm font-mono font-semibold text-[#a855f7] tracking-wider select-all",
        )}
      >
        {code}
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied!" : "Copy referral code"}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
          "border transition-colors duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7]",
          copied
            ? "bg-[#22c55e]/15 border-[#22c55e]/30 text-[#22c55e]"
            : "bg-[#16213e] border-[#2a2a4e] text-[#94a3b8] hover:border-[#a855f7]/40 hover:text-[#a855f7]",
        )}
      >
        {copied ? (
          <Check className="w-4 h-4" aria-hidden="true" />
        ) : (
          <Copy className="w-4 h-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

// ── Earn card ─────────────────────────────────────────────────────────────────

function EarnPointsCard({ card }: { card: EarnCard }) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl shrink-0",
            "bg-[#a855f7]/15 border border-[#a855f7]/25 text-[#a855f7]",
          )}
          aria-hidden="true"
        >
          {card.icon}
        </span>
        <span className="text-sm font-bold text-[#f59e0b] tabular-nums shrink-0">
          {card.reward}
        </span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#f1f5f9] leading-tight">
          {card.title}
        </p>
        <p className="text-xs text-[#64748b] mt-1 leading-snug">
          {card.description}
        </p>
      </div>
      {card.action}
    </Card>
  );
}

// ── Locked redeem item ────────────────────────────────────────────────────────

function LockedRewardItem({ item }: { item: RedeemItem }) {
  return (
    <Card className="flex items-center gap-4 p-4 opacity-60">
      <span
        className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-[#16213e] border border-[#2a2a4e]"
        aria-hidden="true"
      >
        {item.emoji}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-[#f1f5f9] truncate">
            {item.title}
          </p>
          <Badge variant="default" size="sm">
            Phase 2
          </Badge>
        </div>
        <p className="text-xs text-[#64748b]">{item.description}</p>
        <p className="text-xs text-[#94a3b8] mt-1 font-medium tabular-nums">
          {item.cost.toLocaleString()} pts
        </p>
      </div>
      <span
        className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-[#16213e] border border-[#2a2a4e] text-[#64748b]"
        aria-label="Locked — coming in Phase 2"
      >
        <Lock className="w-4 h-4" aria-hidden="true" />
      </span>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RewardsPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [adCooldown, setAdCooldown] = useState(false);
  const [adWatched, setAdWatched] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(() => {
      setAuthChecked(true);
    });
  }, []);

  const handleWatchAd = () => {
    if (adCooldown || adWatched) return;
    setAdCooldown(true);
    setTimeout(() => {
      setAdCooldown(false);
      setAdWatched(true);
    }, 1500);
  };

  const EARN_CARDS: EarnCard[] = [
    {
      id: "watch-ad",
      icon: <Play className="w-5 h-5" />,
      title: "Watch an Ad",
      description: "Earn points instantly by watching a short sponsored video.",
      reward: `+${AD_REWARD_POINTS} pts`,
      action: (
        <Button
          variant={adWatched ? "secondary" : "primary"}
          size="sm"
          isLoading={adCooldown}
          disabled={adWatched}
          onClick={handleWatchAd}
          className="w-full"
        >
          {adWatched ? (
            <>
              <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
              Claimed
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
              Watch Ad
            </>
          )}
        </Button>
      ),
    },
    {
      id: "refer",
      icon: <Users className="w-5 h-5" />,
      title: "Refer a Friend",
      description: `Share your code. Earn ${REFERRAL_REWARD_POINTS} pts when they sign up and play their first match.`,
      reward: `+${REFERRAL_REWARD_POINTS} pts`,
      action: <ReferralCode code={REFERRAL_CODE} />,
    },
    {
      id: "win-match",
      icon: <Trophy className="w-5 h-5" />,
      title: "Win a Match",
      description:
        "Earn your opponent's wagered points on every match you win in the arena.",
      reward: "+ wager pts",
      action: (
        <Button variant="outline" size="sm" className="w-full">
          <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
          Find a Match
        </Button>
      ),
    },
    {
      id: "complete-profile",
      icon: <CheckCircle className="w-5 h-5" />,
      title: "Complete Your Profile",
      description:
        "Add a bio, link a game, and verify your account to collect your bonus.",
      reward: `+${PROFILE_COMPLETE_REWARD} pts`,
      action: (
        <div
          className={cn(
            "flex items-center justify-center gap-2 py-2 rounded-xl",
            "bg-[#22c55e]/10 border border-[#22c55e]/25 text-[#22c55e]",
            "text-xs font-semibold",
          )}
          aria-label="Profile completion reward already collected"
        >
          <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
          Completed ✓
        </div>
      ),
    },
  ];

  const REDEEM_ITEMS: RedeemItem[] = [
    {
      id: "avatar-frame",
      emoji: "🖼️",
      title: "Exclusive Avatar Frame",
      description: "Stand out with a rare animated profile border.",
      cost: 2000,
    },
    {
      id: "pro-badge",
      emoji: "👑",
      title: "PRO Badge",
      description: "Display the coveted PRO crown on your profile.",
      cost: 5000,
    },
    {
      id: "username-colour",
      emoji: "🎨",
      title: "Custom Username Colour",
      description: "Pick any colour for your in-app display name.",
      cost: 1500,
    },
  ];

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Rewards</h1>
          <p className="text-sm text-[#64748b] mt-1">
            Earn points, climb the ranks, unlock exclusives.
          </p>
        </div>
        <PointsChip points={USER_POINTS} />
      </div>

      {/* ── Daily streak ─────────────────────────────────────────── */}
      <section aria-labelledby="streak-heading">
        <h2
          id="streak-heading"
          className="text-base font-semibold text-[#f1f5f9] mb-3"
        >
          Daily Streak
        </h2>
        <StreakCard />
      </section>

      {/* ── Earn points ──────────────────────────────────────────── */}
      <section aria-labelledby="earn-heading">
        <h2
          id="earn-heading"
          className="text-base font-semibold text-[#f1f5f9] mb-3"
        >
          Earn Points
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EARN_CARDS.map((card) => (
            <EarnPointsCard key={card.id} card={card} />
          ))}
        </div>
      </section>

      {/* ── Redeem (coming soon) ─────────────────────────────────── */}
      <section aria-labelledby="redeem-heading">
        <div className="flex items-center gap-3 mb-3">
          <h2
            id="redeem-heading"
            className="text-base font-semibold text-[#f1f5f9]"
          >
            Redeem
          </h2>
          <Badge variant="default" size="sm">
            Coming Soon
          </Badge>
        </div>
        <div className="flex flex-col gap-3">
          {REDEEM_ITEMS.map((item) => (
            <LockedRewardItem key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
