"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface WalletTransaction {
  id: string;
  user_id: string;
  type: "earn" | "spend" | "wager" | "win" | "refund" | "purchase";
  points: number;
  description: string | null;
  reference_type: string | null;
  reference_id: string | null;
  created_at: string;
}

interface WalletData {
  balance: number;
  transactions: WalletTransaction[];
  totalEarned: number;
  totalSpent: number;
}

export function useWallet(userId?: string) {
  const [data, setData] = useState<WalletData>({
    balance: 0,
    transactions: [],
    totalEarned: 0,
    totalSpent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchWallet = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get user profile for balance
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("points")
          .eq("id", userId)
          .single();

        if (profileError) {
          throw profileError;
        }

        // Get transactions
        const { data: transactions, error: txError } = await supabase
          .from("wallet_transactions")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(50);

        if (txError) {
          throw txError;
        }

        const totalEarned =
          transactions
            ?.filter((t) => t.type === "earn" || t.type === "win" || t.type === "refund")
            .reduce((sum, t) => sum + t.points, 0) || 0;

        const totalSpent =
          transactions
            ?.filter((t) => t.type === "spend" || t.type === "wager" || t.type === "purchase")
            .reduce((sum, t) => sum + t.points, 0) || 0;

        setData({
          balance: profile?.points || 0,
          transactions: (transactions as any[] || []).map(t => ({
            ...t,
            type: t.type as WalletTransaction["type"],
            status: t.status as any
          })),
          totalEarned,
          totalSpent,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch wallet");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallet();

    // Subscribe to changes
    const channel = supabase
      .channel("wallet_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "wallet_transactions",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchWallet();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  return { ...data, isLoading, error, refresh: () => {} };
}
