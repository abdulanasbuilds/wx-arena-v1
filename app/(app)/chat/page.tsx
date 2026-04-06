"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Plus, MessageCircle, Users, Gamepad2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ChatCard } from "@/components/features/ChatCard";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils/cn";
import type { ChatRoom, ChatMessage } from "@/types/app.types";

// ─── Mock data ────────────────────────────────────────────────────────────────

const now = Date.now();
const ts = (offsetMs: number) => new Date(now - offsetMs).toISOString();

const MOCK_ROOMS: ChatRoom[] = [
  {
    id: "room-1",
    name: "eFootball Arena",
    type: "game_room",
    game_id: "efootball",
    participants: ["current-user-id", "opp-1", "opp-2"],
    unread_count: 3,
    last_message: {
      id: "lm1",
      room_id: "room-1",
      user_id: "opp-1",
      content: "Anyone up for a quick 1v1?",
      created_at: ts(1000 * 60 * 2),
    },
  },
  {
    id: "room-2",
    name: "Free Fire HQ",
    type: "game_room",
    game_id: "free-fire",
    participants: ["current-user-id", "opp-3"],
    unread_count: 0,
    last_message: {
      id: "lm2",
      room_id: "room-2",
      user_id: "current-user-id",
      content: "GG! Rematch tomorrow?",
      created_at: ts(1000 * 60 * 45),
    },
  },
  {
    id: "room-3",
    name: "WX General",
    type: "group",
    participants: ["current-user-id", "opp-1", "opp-2", "opp-3", "opp-4"],
    unread_count: 12,
    last_message: {
      id: "lm3",
      room_id: "room-3",
      user_id: "opp-2",
      content: "Season 3 tournament starts Friday 🔥",
      created_at: ts(1000 * 60 * 8),
    },
  },
  {
    id: "room-4",
    name: "DragonKick",
    type: "direct",
    participants: ["current-user-id", "opp-1"],
    unread_count: 1,
    last_message: {
      id: "lm4",
      room_id: "room-4",
      user_id: "opp-1",
      content: "Yo, want to wager 500 pts?",
      created_at: ts(1000 * 60 * 20),
    },
  },
];

const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  "room-1": [
    {
      id: "msg-1-1",
      room_id: "room-1",
      user_id: "opp-1",
      content: "Welcome to the eFootball Arena channel!",
      created_at: ts(1000 * 60 * 30),
    },
    {
      id: "msg-1-2",
      room_id: "room-1",
      user_id: "current-user-id",
      content: "Let's run it 🔥 I'm ready.",
      created_at: ts(1000 * 60 * 20),
    },
    {
      id: "msg-1-3",
      room_id: "room-1",
      user_id: "opp-2",
      content: "Count me in. 200 pts wager?",
      created_at: ts(1000 * 60 * 15),
    },
    {
      id: "msg-1-4",
      room_id: "room-1",
      user_id: "current-user-id",
      content: "Make it 300 and I'm in.",
      created_at: ts(1000 * 60 * 10),
    },
    {
      id: "msg-1-5",
      room_id: "room-1",
      user_id: "opp-1",
      content: "Anyone up for a quick 1v1?",
      created_at: ts(1000 * 60 * 2),
    },
  ],
  "room-2": [
    {
      id: "msg-2-1",
      room_id: "room-2",
      user_id: "opp-3",
      content: "That was a close match bro",
      created_at: ts(1000 * 60 * 60),
    },
    {
      id: "msg-2-2",
      room_id: "room-2",
      user_id: "current-user-id",
      content: "You got me in the final zone lol",
      created_at: ts(1000 * 60 * 55),
    },
    {
      id: "msg-2-3",
      room_id: "room-2",
      user_id: "opp-3",
      content: "Skill diff 😈",
      created_at: ts(1000 * 60 * 50),
    },
    {
      id: "msg-2-4",
      room_id: "room-2",
      user_id: "current-user-id",
      content: "Next time I'm not missing 💀",
      created_at: ts(1000 * 60 * 48),
    },
    {
      id: "msg-2-5",
      room_id: "room-2",
      user_id: "current-user-id",
      content: "GG! Rematch tomorrow?",
      created_at: ts(1000 * 60 * 45),
    },
  ],
  "room-3": [
    {
      id: "msg-3-1",
      room_id: "room-3",
      user_id: "opp-4",
      content: "Who's participating in Season 3?",
      created_at: ts(1000 * 60 * 25),
    },
    {
      id: "msg-3-2",
      room_id: "room-3",
      user_id: "current-user-id",
      content: "Me for sure. Already signed up.",
      created_at: ts(1000 * 60 * 20),
    },
    {
      id: "msg-3-3",
      room_id: "room-3",
      user_id: "opp-1",
      content: "Same, locked and loaded 💪",
      created_at: ts(1000 * 60 * 15),
    },
    {
      id: "msg-3-4",
      room_id: "room-3",
      user_id: "opp-3",
      content: "Prize pool is 50,000 pts this time!",
      created_at: ts(1000 * 60 * 12),
    },
    {
      id: "msg-3-5",
      room_id: "room-3",
      user_id: "opp-2",
      content: "Season 3 tournament starts Friday 🔥",
      created_at: ts(1000 * 60 * 8),
    },
  ],
  "room-4": [
    {
      id: "msg-4-1",
      room_id: "room-4",
      user_id: "current-user-id",
      content: "Good game earlier man",
      created_at: ts(1000 * 60 * 40),
    },
    {
      id: "msg-4-2",
      room_id: "room-4",
      user_id: "opp-1",
      content: "Yeah that was intense!",
      created_at: ts(1000 * 60 * 35),
    },
    {
      id: "msg-4-3",
      room_id: "room-4",
      user_id: "current-user-id",
      content: "Rematch anytime. I'll be ready.",
      created_at: ts(1000 * 60 * 30),
    },
    {
      id: "msg-4-4",
      room_id: "room-4",
      user_id: "opp-1",
      content: "Say less. Let's make it interesting 😏",
      created_at: ts(1000 * 60 * 25),
    },
    {
      id: "msg-4-5",
      room_id: "room-4",
      user_id: "opp-1",
      content: "Yo, want to wager 500 pts?",
      created_at: ts(1000 * 60 * 20),
    },
  ],
};

const USER_NAMES: Record<string, string> = {
  "current-user-id": "GhostSniper",
  "opp-1": "DragonKick",
  "opp-2": "PhantomBlaze",
  "opp-3": "SteelNova",
  "opp-4": "VoidReaper",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRoomTypeLabel(type: ChatRoom["type"]): string {
  if (type === "game_room") return "Game Room";
  if (type === "group") return "Group";
  return "Direct";
}

function getRoomTypeBadgeVariant(
  type: ChatRoom["type"],
): "info" | "success" | "default" {
  if (type === "game_room") return "info";
  if (type === "group") return "success";
  return "default";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const name = USER_NAMES[message.user_id] ?? "Unknown";
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
  const [messages, setMessages] = useState<ChatMessage[]>(
    MOCK_MESSAGES[room.id] ?? [],
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(MOCK_MESSAGES[room.id] ?? []);
    setInput("");
  }, [room.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const newMsg: ChatMessage = {
      id: `new-${Date.now()}`,
      room_id: room.id,
      user_id: currentUserId,
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.user_id === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

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
  const [currentUserId, setCurrentUserId] = useState("current-user-id");
  const [showList, setShowList] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
      setAuthChecked(true);
    });
  }, []);

  const selectedRoom = MOCK_ROOMS.find((r) => r.id === selectedRoomId) ?? null;

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
            {MOCK_ROOMS.map((room) => (
              <ChatCard
                key={room.id}
                room={room}
                onClick={() => handleSelectRoom(room.id)}
              />
            ))}
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
          {selectedRoom ? (
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
