"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { GameId } from "@/types/app.types";

interface Community {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  game_id: GameId | null;
  owner_id: string;
  member_count: number;
  max_members: number;
  is_public: boolean;
  is_member?: boolean;
  user_role?: "owner" | "admin" | "moderator" | "member" | null;
}

export function useCommunities(userId: string) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Fetch public communities
  useEffect(() => {
    const fetchCommunities = async () => {
      const { data, error } = await supabase
        .from("communities")
        .select(`
          *,
          community_members!inner(user_id, role)
        `)
        .eq("is_public", true)
        .order("member_count", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Fetch communities error:", error);
        return;
      }

      const formatted: Community[] = data.map((c: any) => ({
        ...c,
        is_member: c.community_members?.some((m: any) => m.user_id === userId),
        user_role: c.community_members?.find((m: any) => m.user_id === userId)?.role || null,
      }));

      setCommunities(formatted);
    };

    const fetchMyCommunities = async () => {
      const { data, error } = await supabase
        .from("community_members")
        .select(`
          role,
          communities(*)
        `)
        .eq("user_id", userId);

      if (error) return;

      const formatted: Community[] = data.map((m: any) => ({
        ...m.communities,
        is_member: true,
        user_role: m.role,
      }));

      setMyCommunities(formatted);
      setIsLoading(false);
    };

    fetchCommunities();
    fetchMyCommunities();
  }, [userId, supabase]);

  // Create community
  const createCommunity = useCallback(
    async (data: {
      name: string;
      description?: string;
      game_id?: GameId;
      is_public?: boolean;
    }) => {
      const { data: community, error } = await supabase
        .from("communities")
        .insert({
          name: data.name,
          description: data.description,
          game_id: data.game_id,
          owner_id: userId,
          is_public: data.is_public ?? true,
        })
        .select()
        .single();

      if (error || !community) return null;

      // Add creator as owner
      await supabase.from("community_members").insert({
        community_id: community.id,
        user_id: userId,
        role: "owner",
      });

      return community;
    },
    [userId, supabase]
  );

  // Join community
  const joinCommunity = useCallback(
    async (communityId: string) => {
      const { error } = await supabase.from("community_members").insert({
        community_id: communityId,
        user_id: userId,
        role: "member",
      });

      if (!error) {
        // Update member count
        await supabase.rpc("increment_community_members", {
          community_id: communityId,
        });
      }

      return !error;
    },
    [userId, supabase]
  );

  // Leave community
  const leaveCommunity = useCallback(
    async (communityId: string) => {
      const { error } = await supabase
        .from("community_members")
        .delete()
        .match({ community_id: communityId, user_id: userId });

      if (!error) {
        await supabase.rpc("decrement_community_members", {
          community_id: communityId,
        });
        setMyCommunities((prev) => prev.filter((c) => c.id !== communityId));
      }

      return !error;
    },
    [userId, supabase]
  );

  return {
    communities,
    myCommunities,
    isLoading,
    createCommunity,
    joinCommunity,
    leaveCommunity,
  };
}
