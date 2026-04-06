"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage, ChatRoom } from "@/types/app.types";

interface UseRealtimeChatProps {
  roomId: string;
  userId: string;
}

interface UseRealtimeChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  typingUsers: string[];
  setTyping: (isTyping: boolean) => void;
  reactions: Record<string, string[]>; // messageId -> emoji[]
  addReaction: (messageId: string, emoji: string) => Promise<void>;
}

export function useRealtimeChat({ roomId, userId }: UseRealtimeChatProps): UseRealtimeChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [reactions, setReactions] = useState<Record<string, string[]>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*, profiles:user_id(username, avatar_url)")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) {
        setError(error.message);
      } else {
        setMessages(
          data.map((m: any) => ({
            id: m.id,
            room_id: m.room_id,
            user_id: m.user_id,
            content: m.content,
            created_at: m.created_at,
            username: m.profiles?.username,
            avatar_url: m.profiles?.avatar_url,
          }))
        );
      }
      setIsLoading(false);
    };

    fetchMessages();
  }, [roomId, supabase]);

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          // Fetch user details
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", newMessage.user_id)
            .single();

          setMessages((prev) => [
            ...prev,
            {
              id: newMessage.id,
              room_id: newMessage.room_id,
              user_id: newMessage.user_id,
              content: newMessage.content,
              created_at: newMessage.created_at,
              username: profile?.username,
              avatar_url: profile?.avatar_url,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, supabase]);

  // Subscribe to typing indicators
  useEffect(() => {
    const channel = supabase
      .channel(`typing:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "typing_indicators",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const typing = payload.new as any;
            if (typing.user_id !== userId) {
              setTypingUsers((prev) => [...new Set([...prev, typing.user_id])]);
            }
          } else if (payload.eventType === "DELETE") {
            const typing = payload.old as any;
            setTypingUsers((prev) => prev.filter((id) => id !== typing.user_id));
          }
        }
      )
      .subscribe();

    // Cleanup old typing indicators periodically
    const interval = setInterval(async () => {
      await supabase
        .from("typing_indicators")
        .delete()
        .lt("started_at", new Date(Date.now() - 5000).toISOString());
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [roomId, userId, supabase]);

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      const { error } = await supabase.from("chat_messages").insert({
        room_id: roomId,
        user_id: userId,
        content: content.trim(),
      });

      if (error) throw error;

      // Clear typing indicator
      await supabase
        .from("typing_indicators")
        .delete()
        .match({ room_id: roomId, user_id: userId });
    },
    [roomId, userId, supabase]
  );

  // Set typing indicator
  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (isTyping) {
        await supabase.from("typing_indicators").upsert({
          room_id: roomId,
          user_id: userId,
          started_at: new Date().toISOString(),
        });

        // Auto-clear after 3 seconds
        typingTimeoutRef.current = setTimeout(async () => {
          await supabase
            .from("typing_indicators")
            .delete()
            .match({ room_id: roomId, user_id: userId });
        }, 3000);
      } else {
        await supabase
          .from("typing_indicators")
          .delete()
          .match({ room_id: roomId, user_id: userId });
      }
    },
    [roomId, userId, supabase]
  );

  // Add reaction
  const addReaction = useCallback(
    async (messageId: string, emoji: string) => {
      const { error } = await supabase.from("message_reactions").insert({
        message_id: messageId,
        user_id: userId,
        reaction: emoji,
      });

      if (error && !error.message.includes("duplicate")) {
        throw error;
      }

      setReactions((prev) => ({
        ...prev,
        [messageId]: [...(prev[messageId] || []), emoji],
      }));
    },
    [userId, supabase]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    typingUsers,
    setTyping,
    reactions,
    addReaction,
  };
}
