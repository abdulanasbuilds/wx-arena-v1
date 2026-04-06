"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Trophy, Upload, X, Check, AlertTriangle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface MatchResult {
  match_id: string;
  winner_id: string;
  score_player_1: number;
  score_player_2: number;
  screenshot_url?: string;
  notes?: string;
}

export default function SubmitResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("match_id");

  const [winner, setWinner] = useState<"player1" | "player2" | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Mock match data - in real app, fetch from Supabase
  const match = {
    id: matchId || "match-123",
    game_name: "eFootball",
    player1: { id: "me", username: "You", avatar_url: null },
    player2: { id: "opp", username: "DragonKick", avatar_url: null },
    wager_points: 500,
    started_at: new Date().toISOString(),
  };

  const handleSubmit = async () => {
    if (!winner) return;
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitted(true);
    
    // Redirect after 2 seconds
    setTimeout(() => {
      router.push("/matches");
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-[#f1f5f9] mb-2">Result Submitted!</h1>
        <p className="text-[#64748b] mb-6">
          Your match result has been submitted and is awaiting verification.
        </p>
        <Link href="/matches">
          <Button variant="primary">Back to Matches</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/matches">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Submit Match Result</h1>
          <p className="text-sm text-[#64748b]">
            {match.game_name} • {match.wager_points} points wagered
          </p>
        </div>
      </div>

      {/* Match Info Card */}
      <div className="bg-[#0d0d14] border border-[#2a2a4e] rounded-xl p-6">
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <Avatar username={match.player1.username} size="lg" />
            <p className="mt-2 font-medium text-[#f1f5f9]">{match.player1.username}</p>
            <Badge variant="default" size="sm" className="mt-1">You</Badge>
          </div>
          
          <div className="text-center px-4">
            <p className="text-2xl font-bold text-[#a855f7]">VS</p>
            <p className="text-xs text-[#64748b] mt-1">Match #{match.id.slice(-4)}</p>
          </div>
          
          <div className="text-center">
            <Avatar username={match.player2.username} size="lg" />
            <p className="mt-2 font-medium text-[#f1f5f9]">{match.player2.username}</p>
            <Badge variant="default" size="sm" className="mt-1">Opponent</Badge>
          </div>
        </div>
      </div>

      {/* Winner Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#94a3b8]">Who won the match?</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setWinner("player1")}
            className={cn(
              "p-4 rounded-xl border transition-all text-center",
              winner === "player1"
                ? "bg-[#a855f7]/20 border-[#a855f7] text-[#f1f5f9]"
                : "bg-[#0d0d14] border-[#2a2a4e] text-[#64748b] hover:border-[#a855f7]/40"
            )}
          >
            <Trophy className={cn("w-6 h-6 mx-auto mb-2", winner === "player1" ? "text-[#a855f7]" : "text-[#64748b]")} />
            <p className="font-medium">I Won</p>
          </button>
          <button
            onClick={() => setWinner("player2")}
            className={cn(
              "p-4 rounded-xl border transition-all text-center",
              winner === "player2"
                ? "bg-red-500/20 border-red-500 text-[#f1f5f9]"
                : "bg-[#0d0d14] border-[#2a2a4e] text-[#64748b] hover:border-red-500/40"
            )}
          >
            <p className="font-medium">{match.player2.username} Won</p>
          </button>
        </div>
      </div>

      {/* Score Input */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#94a3b8]">Final Score</label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-[#64748b]">Your Score</p>
            <input
              type="number"
              min="0"
              value={myScore}
              onChange={(e) => setMyScore(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-[#0d0d14] border border-[#2a2a4e] text-[#f1f5f9] text-center text-lg font-bold focus:border-[#a855f7] outline-none"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-[#64748b]">Opponent Score</p>
            <input
              type="number"
              min="0"
              value={opponentScore}
              onChange={(e) => setOpponentScore(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-[#0d0d14] border border-[#2a2a4e] text-[#f1f5f9] text-center text-lg font-bold focus:border-[#a855f7] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Screenshot Upload */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#94a3b8]">Upload Screenshot (Optional)</label>
        <div className="border-2 border-dashed border-[#2a2a4e] rounded-xl p-6 text-center hover:border-[#a855f7]/40 transition-colors cursor-pointer">
          {screenshot ? (
            <div className="flex items-center justify-center gap-2 text-[#f1f5f9]">
              <Check className="w-5 h-5 text-green-500" />
              <span>{screenshot.name}</span>
              <button
                onClick={() => setScreenshot(null)}
                className="p-1 hover:bg-red-500/20 rounded"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-[#64748b] mx-auto mb-2" />
              <p className="text-sm text-[#64748b]">Click to upload match screenshot</p>
              <p className="text-xs text-[#64748b] mt-1">PNG, JPG up to 5MB</p>
            </>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#94a3b8]">Additional Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any issues or details about the match..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-[#0d0d14] border border-[#2a2a4e] text-[#f1f5f9] placeholder:text-[#64748b] focus:border-[#a855f7] outline-none resize-none"
        />
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-500">
          Submitting false results may result in penalties including account suspension. 
          Both players must submit matching results for the wager to be processed.
        </p>
      </div>

      {/* Submit */}
      <Button
        variant="primary"
        size="lg"
        className="w-full gap-2"
        disabled={!winner || isSubmitting}
        onClick={handleSubmit}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Trophy className="w-5 h-5" />
            Submit Result
          </>
        )}
      </Button>
    </div>
  );
}
