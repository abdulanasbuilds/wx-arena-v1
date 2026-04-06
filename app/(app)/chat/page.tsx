"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, Plus, MessageCircle, Users, Smile, Gamepad2 } from "lucide-react";
import { useRef } from "react";
import type { ChatMessage } from "@/types/app.types";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { useFriends } from "@/hooks/useFriends";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils/cn";
import type { ChatRoom } from "@/types/app.types";

const REACTIONS = ["👍", "❤️", "😂", "🔥", "😮", "👏"];

// ─── Main Chat Page ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
      <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#16213e] border border-[#2a2a4e] text-[#a855f7]">
        <MessageCircle className="w-7 h-7" aria-hidden="true" />
      </span>
      <div>
        <p className="text-base font-semibold text-[#f1f5f9]">
          No conversation selected
        </p>
        <p className="text-sm text-[#64748b] mt-1">
          Pick a room from the list to start chatting
        </p>
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getRoomTypeLabel(type: string): string {
  if (type === "game_room") return "Game Room";
  if (type === "group") return "Group";
  return "Direct";
}

function getRoomTypeBadgeVariant(type: string): "info" | "success" | "default" {
  if (type === "game_room") return "info";
  if (type === "group") return "success";
  return "default";
}

interface ChatCardProps {
  room: any;
  onClick: () => void;
}

function ChatCard({ room, onClick }: ChatCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-[#1a1a2e] transition-colors"
    >
      <span className="text-2xl">
        {room.type === "game_room" ? "🎮" : room.type === "group" ? "👥" : "💬"}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[#f1f5f9] truncate">{room.name}</p>
        <p className="text-xs text-[#64748b] capitalize">{room.type?.replace("_", " ")}</p>
      </div>
    </button>
  );
}
interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const name = message.username ?? "Unknown";
  return (
    <div className={cn("flex items-end gap-2", isOwn && "flex-row-reverse")}>
      {!isOwn && (
        <Avatar username={name} size="xs" className="shrink-0 mb-0.5" />
      )}
      <div
        className={cn("flex flex-col gap-1 max-w-[72%]", isOwn && "items-end")}
      >
        {!isOwn && (
          <span className="text-[11px] text-[#64748b] px-1">{name}</span>
        )}
        <div
          className={cn(
            "px-3 py-2 rounded-2xl text-sm leading-snug",
            isOwn
              ? "bg-[#a855f7] text-white rounded-br-sm"
              : "bg-[#1a1a2e] border border-[#2a2a4e] text-[#f1f5f9] rounded-bl-sm",
          )}
        >
          {message.content}
        </div>
        <span className="text-[10px] text-[#64748b] px-1 tabular-nums">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}

interface ChatPanelProps {
  room: ChatRoom;
  currentUserId: string;
  onBack: () => void;
}

function ChatPanel({ room, currentUserId, onBack }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isLoading: messagesLoading,
    sendMessage,
    typingUsers,
    setTyping,
  } = useRealtimeChat({
    roomId: room.id,
    userId: currentUserId,
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    await sendMessage(trimmed);
    setInput("");
    setTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else {
      setTyping(true);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Room header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2a4e] bg-[#1a1a2e] shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="md:hidden text-[#94a3b8] hover:text-[#f1f5f9] transition-colors p-1 -ml-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7]"
          aria-label="Back to room list"
        >
          ←
        </button>

        <span className="text-lg" aria-hidden="true">
          {room.type === "game_room"
            ? "🎮"
            : room.type === "group"
              ? "👥"
              : "💬"}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#f1f5f9] truncate">
              {room.name}
            </p>
            <Badge variant={getRoomTypeBadgeVariant(room.type)} size="sm">
              {getRoomTypeLabel(room.type)}
            </Badge>
          </div>
          <p className="text-xs text-[#64748b]">
            {room.participants.length} members
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {messagesLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-[#64748b]">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.user_id === currentUserId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-xs text-[#64748b] flex items-center gap-2">
          <span className="flex gap-0.5">
            <span className="w-1.5 h-1.5 bg-[#a855f7] rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-[#a855f7] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-[#a855f7] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
          Someone is typing...
        </div>
      )}

      {/* Input area */}
      <div className="shrink-0 px-4 py-3 border-t border-[#2a2a4e] bg-[#1a1a2e]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${room.name}…`}
            maxLength={500}
            className={cn(
              "flex-1 rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9]",
              "bg-[#0d0d14] border border-[#2a2a4e]",
              "placeholder:text-[#64748b] outline-none",
              "focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/30",
              "hover:border-[#3a3a6e] transition-colors duration-150",
            )}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={!input.trim()}
            aria-label="Send message"
            className="shrink-0 w-10 h-10 p-0"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showList, setShowList] = useState(true);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id);
        // Fetch user's chat rooms
        supabase
          .from("chat_room_members")
          .select(`room_id, chat_rooms(id, name, type, game_id)`)
          .eq("user_id", user.id)
          .then(({ data }) => {
            if (data) {
              const formattedRooms = data.map((r: any) => ({
                id: r.chat_rooms.id,
                name: r.chat_rooms.name,
                type: r.chat_rooms.type,
                game_id: r.chat_rooms.game_id,
                participants: [],
                unread_count: 0,
              }));
              setRooms(formattedRooms);
            }
          });
      }
      setAuthChecked(true);
    });
  }, []);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) ?? null;

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setShowList(false);
  };

  const handleBack = () => {
    setShowList(true);
  };

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-0 md:px-4 py-0 md:py-6">
      <div
        className={cn(
          "flex h-[calc(100vh-4rem)] md:h-[calc(100vh-7rem)]",
          "bg-[#0d0d14] md:rounded-2xl md:border md:border-[#2a2a4e] overflow-hidden",
        )}
      >
        {/* ── Left panel: room list ── */}
        <aside
          className={cn(
            "flex flex-col w-full md:w-80 shrink-0",
            "border-r border-[#2a2a4e] bg-[#0d0d14]",
            // Mobile: hide list when a room is selected
            !showList && "hidden md:flex",
          )}
          aria-label="Conversations"
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-[#2a2a4e] shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#a855f7]" aria-hidden="true" />
              <h1 className="text-base font-semibold text-[#f1f5f9]">
                Messages
              </h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              aria-label="Create or join room"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Room list */}
          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1 min-h-0">
            {rooms.length === 0 ? (
              <div className="text-center py-8 text-[#64748b]">
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Join a community to start chatting</p>
              </div>
            ) : (
              rooms.map((room) => (
                <ChatCard
                  key={room.id}
                  room={room}
                  onClick={() => handleSelectRoom(room.id)}
                />
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="shrink-0 px-4 py-3 border-t border-[#2a2a4e]">
            <button
              type="button"
              className={cn(
                "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl",
                "border border-dashed border-[#2a2a4e] text-xs text-[#64748b]",
                "hover:border-[#a855f7]/40 hover:text-[#94a3b8] transition-colors duration-200",
              )}
              aria-label="Create or join a room"
            >
              <Gamepad2 className="w-3.5 h-3.5" aria-hidden="true" />
              Create or join a room
            </button>
          </div>
        </aside>

        {/* ── Right panel: chat UI ── */}
        <main
          className={cn(
            "flex-1 min-w-0",
            // Mobile: hide chat panel when list is shown
            showList && "hidden md:flex md:flex-col",
            !showList && "flex flex-col",
          )}
        >
          {selectedRoom && currentUserId ? (
            <ChatPanel
              room={selectedRoom}
              currentUserId={currentUserId}
              onBack={handleBack}
            />
          ) : (
            <EmptyState />
          )}
        </main>
      </div>
    </div>
  );
}
