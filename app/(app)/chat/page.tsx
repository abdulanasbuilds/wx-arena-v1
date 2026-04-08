"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Send, Plus, MessageCircle, Users, Smile, Gamepad2, Hash, Search, MoreVertical, Paperclip, Trophy } from "lucide-react";
import type { ChatMessage, ChatRoom } from "@/types/app.types";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";

// ─── Utility ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Shared Components ────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-12 text-center bg-[#050508]/50">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 text-primary shadow-[0_0_40px_rgba(124,58,237,0.1)]"
      >
        <MessageCircle className="w-10 h-10" />
      </motion.div>
      <div className="max-w-xs space-y-2">
        <p className="text-xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-syne)' }}>
          NO COMM-SIGNAL.
        </p>
        <p className="text-sm text-[#64748b] leading-relaxed">
          Select a secure channel from the encrypted list to begin worldwide communication.
        </p>
      </div>
    </div>
  );
}

function ChatCard({ room, isActive, onClick }: { room: any; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden",
        isActive 
          ? "bg-primary/10 border border-primary/30 shadow-[inset_0_0_20px_rgba(124,58,237,0.05)]" 
          : "hover:bg-white/[0.03] border border-transparent"
      )}
    >
      {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full" />}
      
      <div className={cn(
        "relative w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 border transition-all duration-300",
        isActive ? "bg-primary/20 border-primary/40" : "bg-white/5 border-white/10 group-hover:border-white/20"
      )}>
        {room.type === "game_room" ? "🎮" : "👥"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
          <p className={cn(
            "font-black text-sm tracking-tight truncate",
            isActive ? "text-white" : "text-white/60 group-hover:text-white"
          )}>
            {room.name.toUpperCase()}
          </p>
          <span className="text-[10px] text-white/20 font-bold uppercase tabular-nums">12:40</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest leading-none">
             {room.type?.replace("_", " ")}
           </span>
           <span className="w-1 h-1 rounded-full bg-white/10" />
           <p className="text-[11px] text-[#64748b] truncate">Ready for the challenge...</p>
        </div>
      </div>
      
      {room.unread_count > 0 && (
        <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
          {room.unread_count}
        </span>
      )}
    </button>
  );
}

function MessageBubble({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  const name = message.username ?? "Unknown";
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex items-end gap-3", isOwn && "flex-row-reverse")}
    >
      {!isOwn && (
        <div className="relative shrink-0 mb-1">
           <Avatar username={name} size="sm" className="border border-white/10" />
           <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0d0d14] rounded-full" />
        </div>
      )}
      
      <div className={cn("flex flex-col gap-1.5 max-w-[75%]", isOwn && "items-end")}>
        {!isOwn && (
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-2">{name}</span>
        )}
        <div
          className={cn(
            "px-4 py-3 rounded-[1.25rem] text-sm leading-relaxed shadow-lg relative overflow-hidden",
            isOwn
              ? "bg-primary text-white rounded-br-none shadow-primary/20"
              : "bg-white/[0.03] border border-white/10 text-white/90 rounded-bl-none"
          )}
        >
          {isOwn && (
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-3xl -mr-12 -mt-12 pointer-events-none" />
          )}
          {message.content}
        </div>
        <div className={cn("flex items-center gap-2 px-1", isOwn && "flex-row-reverse")}>
           <span className="text-[10px] text-white/20 font-bold tracking-widest tabular-nums uppercase">
              {formatTime(message.created_at)}
           </span>
           {isOwn && <span className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">Sent</span>}
        </div>
      </div>
    </motion.div>
  );
}

function ChatPanel({ room, currentUserId, onBack }: { room: ChatRoom; currentUserId: string; onBack: () => void }) {
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

  return (
    <div className="flex flex-col h-full bg-[#050508]/40">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#0d0d14]/80 backdrop-blur-xl z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="lg:hidden p-2 text-white/60 hover:text-white transition-colors">
            ←
          </button>
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">
             {room.type === "game_room" ? "🎮" : "👥"}
          </div>
          <div>
            <div className="flex items-center gap-2">
               <h2 className="text-lg font-black text-white tracking-tighter" style={{ fontFamily: 'var(--font-syne)' }}>
                 {room.name.toUpperCase()}
               </h2>
               <Badge variant="primary" className="text-[9px] py-0 px-2 uppercase tracking-widest h-4">
                 {room.type?.replace("_", " ")}
               </Badge>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-widest">
                 {room.participants.length} COMPETITORS ONLINE
               </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all">
                <Search size={18} />
            </button>
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all">
                <MoreVertical size={18} />
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scrollbar-hide">
        {messagesLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center px-12 opacity-30">
             <div className="space-y-4">
                <Trophy size={48} className="mx-auto" />
                <p className="text-sm font-black uppercase tracking-[0.2em]">Encrypted Line Established</p>
             </div>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} isOwn={msg.user_id === currentUserId} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/5 bg-[#0d0d14]/80 backdrop-blur-xl">
         <AnimatePresence>
           {typingUsers.length > 0 && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 10 }}
               className="mb-3 px-4 py-2 text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2"
             >
               <span className="flex gap-1">
                 {[0, 1, 2].map(i => (
                   <span key={i} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                 ))}
               </span>
               Signal Incoming...
             </motion.div>
           )}
         </AnimatePresence>

         <div className="relative group">
            <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-3">
              <button className="p-3 text-white/30 hover:text-primary transition-colors">
                 <Paperclip size={20} />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                  else { setTyping(true); }
                }}
                placeholder={`Transmitting to ${room.name}...`}
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-primary/50 transition-all font-medium"
              />
              <button className="p-3 text-white/30 hover:text-primary transition-colors">
                 <Smile size={20} />
              </button>
              <Button
                variant="primary"
                onClick={handleSend}
                disabled={!input.trim()}
                className="shrink-0 w-14 h-14 rounded-2xl shadow-xl shadow-primary/20"
              >
                <Send size={20} />
              </Button>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showList, setShowList] = useState(true);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id);
        supabase
          .from("chat_room_members")
          .select(`room_id, chat_rooms(id, name, type, game_id)`)
          .eq("user_id", user.id)
          .then(({ data }) => {
            if (data) {
              setRooms(data.map((r: any) => ({
                id: r.chat_rooms.id,
                name: r.chat_rooms.name,
                type: r.chat_rooms.type,
                game_id: r.chat_rooms.game_id,
                participants: [{ user_id: user.id }], // Mocking for UI
                unread_count: 0,
              })));
            }
          });
      }
      setAuthChecked(true);
    });
  }, []);

  if (!authChecked) return <div className="flex h-[80vh] items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 h-screen md:h-[calc(100vh-2rem)] flex flex-col">
       <div className="flex-1 glass-pro rounded-[2.5rem] border-white/5 overflow-hidden flex shadow-2xl">
          {/* Sidebar */}
          <aside className={cn(
            "w-full lg:w-[400px] border-r border-white/5 flex flex-col bg-[#0d0d14]/50",
            !showList && "hidden lg:flex"
          )}>
             <div className="p-8 pb-4">
                <div className="flex items-center justify-between mb-8">
                   <h1 className="text-3xl font-black text-white tracking-tighter" style={{ fontFamily: 'var(--font-syne)' }}>
                     MESSAGES
                   </h1>
                   <button className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center hover:bg-primary/20 transition-all">
                      <Plus size={20} />
                   </button>
                </div>
                
                <div className="relative group">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                   <input 
                     type="text" 
                     placeholder="Search channels..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold uppercase tracking-widest text-white placeholder:text-white/10 outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                   />
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <div className="px-4 py-2 text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Pinned Channels</div>
                {rooms.map(room => (
                  <ChatCard 
                    key={room.id} 
                    room={room} 
                    isActive={selectedRoomId === room.id} 
                    onClick={() => { setSelectedRoomId(room.id); setShowList(false); }} 
                  />
                ))}
             </div>
             
             <div className="p-6 border-t border-white/5">
                <button className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 border border-dashed border-white/10 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] hover:border-primary/40 hover:text-white transition-all">
                   <Users size={16} /> Discover More Communities
                </button>
             </div>
          </aside>

          {/* Chat Window */}
          <main className={cn(
            "flex-1 min-w-0 bg-[#050508]/20 relative",
            showList && "hidden lg:block",
            !showList && "block"
          )}>
             {selectedRoomId ? (
               <ChatPanel 
                 room={rooms.find(r => r.id === selectedRoomId)!} 
                 currentUserId={currentUserId!} 
                 onBack={() => setShowList(true)} 
               />
             ) : (
               <EmptyState />
             )}
          </main>
       </div>
    </div>
  );
}
