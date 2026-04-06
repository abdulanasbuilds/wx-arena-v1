"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Friend {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  is_online: boolean;
  last_seen: string;
  status: "pending" | "accepted" | "blocked";
  isIncoming: boolean; // Friend request sent to us
}

export function useFriends(userId: string) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [onlineFriends, setOnlineFriends] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Fetch friends list
  useEffect(() => {
    const fetchFriends = async () => {
      const { data, error } = await supabase
        .from("friends")
        .select(`
          id,
          requester_id,
          addressee_id,
          status,
          profiles!friends_requester_id_fkey(id, username, avatar_url),
          profiles!friends_addressee_id_fkey(id, username, avatar_url)
        `)
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq("status", "accepted");

      if (error) {
        console.error("Fetch friends error:", error);
        return;
      }

      const formatted: Friend[] = data.map((f: any) => {
        const isRequester = f.requester_id === userId;
        const friendProfile = isRequester ? f.profiles_addressee_id_fkey : f.profiles_requester_id_fkey;
        
        return {
          id: f.id,
          user_id: isRequester ? f.addressee_id : f.requester_id,
          username: friendProfile?.username || "Unknown",
          avatar_url: friendProfile?.avatar_url,
          is_online: false, // Will be updated by presence
          last_seen: new Date().toISOString(),
          status: f.status,
          isIncoming: false,
        };
      });

      setFriends(formatted);
    };

    const fetchPending = async () => {
      const { data, error } = await supabase
        .from("friends")
        .select(`
          id,
          requester_id,
          addressee_id,
          status,
          profiles!friends_requester_id_fkey(id, username, avatar_url)
        `)
        .eq("addressee_id", userId)
        .eq("status", "pending");

      if (error) return;

      const formatted: Friend[] = data.map((f: any) => ({
        id: f.id,
        user_id: f.requester_id,
        username: f.profiles_requester_id_fkey?.username || "Unknown",
        avatar_url: f.profiles_requester_id_fkey?.avatar_url,
        is_online: false,
        last_seen: new Date().toISOString(),
        status: f.status,
        isIncoming: true,
      }));

      setPendingRequests(formatted);
      setIsLoading(false);
    };

    fetchFriends();
    fetchPending();
  }, [userId, supabase]);

  // Subscribe to online status
  useEffect(() => {
    const channel = supabase
      .channel("online_status")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "online_status",
        },
        (payload) => {
          const status = payload.new as any;
          if (payload.eventType === "DELETE") return;

          setFriends((prev) =>
            prev.map((f) =>
              f.user_id === status.user_id
                ? { ...f, is_online: status.is_online, last_seen: status.last_seen }
                : f
            )
          );

          if (status.is_online) {
            setOnlineFriends((prev) => [...new Set([...prev, status.user_id])]);
          } else {
            setOnlineFriends((prev) => prev.filter((id) => id !== status.user_id));
          }
        }
      )
      .subscribe();

    // Update own status periodically
    const interval = setInterval(async () => {
      await supabase.from("online_status").upsert({
        user_id: userId,
        is_online: true,
        last_seen: new Date().toISOString(),
      });
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [userId, supabase]);

  // Send friend request
  const sendFriendRequest = useCallback(
    async (targetUserId: string) => {
      const { error } = await supabase.from("friends").insert({
        requester_id: userId,
        addressee_id: targetUserId,
        status: "pending",
      });

      return !error;
    },
    [userId, supabase]
  );

  // Accept friend request
  const acceptFriendRequest = useCallback(
    async (friendId: string) => {
      const { error } = await supabase
        .from("friends")
        .update({ status: "accepted" })
        .eq("id", friendId);

      if (!error) {
        setPendingRequests((prev) => prev.filter((f) => f.id !== friendId));
      }

      return !error;
    },
    [supabase]
  );

  // Reject/Remove friend
  const removeFriend = useCallback(
    async (friendId: string) => {
      const { error } = await supabase.from("friends").delete().eq("id", friendId);

      if (!error) {
        setFriends((prev) => prev.filter((f) => f.id !== friendId));
        setPendingRequests((prev) => prev.filter((f) => f.id !== friendId));
      }

      return !error;
    },
    [supabase]
  );

  return {
    friends,
    pendingRequests,
    onlineFriends,
    isLoading,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
  };
}
