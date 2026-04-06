"use client";

import { useState } from "react";
import { Users, UserPlus, UserCheck, UserX, MessageCircle, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface FriendProfile {
  id: string;
  username: string;
  is_online: boolean;
  last_seen: string;
  rank: number;
  win_rate: number;
}

const MOCK_FRIENDS: FriendProfile[] = [
  { id: "f-1", username: "DragonKick", is_online: true, last_seen: new Date().toISOString(), rank: 14, win_rate: 62.5 },
  { id: "f-2", username: "PhantomBlaze", is_online: true, last_seen: new Date().toISOString(), rank: 23, win_rate: 58.2 },
  { id: "f-3", username: "SteelNova", is_online: false, last_seen: new Date(Date.now() - 1000 * 60 * 30).toISOString(), rank: 9, win_rate: 71.3 },
  { id: "f-4", username: "CyberKnight", is_online: false, last_seen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), rank: 4, win_rate: 69.0 },
];

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredFriends = MOCK_FRIENDS.filter((f) => f.username.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/25 text-[#a855f7]">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-[#f1f5f9]">Friends</h1>
            <p className="text-sm text-[#64748b]">{MOCK_FRIENDS.filter((f) => f.is_online).length} online</p>
          </div>
        </div>
        <Button variant="primary" size="sm"><UserPlus className="w-4 h-4 mr-2" />Add Friend</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
        <input type="text" placeholder="Search friends..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d0d14] border border-[#2a2a4e] text-[#f1f5f9] placeholder:text-[#64748b] focus:border-[#a855f7] outline-none" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-medium text-[#64748b] uppercase tracking-wider px-2">Online — {filteredFriends.filter((f) => f.is_online).length}</h3>
        {filteredFriends.filter((f) => f.is_online).map((friend) => <FriendCard key={friend.id} friend={friend} />)}
        <h3 className="text-xs font-medium text-[#64748b] uppercase tracking-wider px-2 mt-4">Offline — {filteredFriends.filter((f) => !f.is_online).length}</h3>
        {filteredFriends.filter((f) => !f.is_online).map((friend) => <FriendCard key={friend.id} friend={friend} />)}
      </div>
    </div>
  );
}

function FriendCard({ friend }: { friend: FriendProfile }) {
  const lastSeenText = friend.is_online ? "Online" : `Last seen ${formatLastSeen(friend.last_seen)}`;
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0d0d14] border border-[#2a2a4e] hover:border-[#a855f7]/40 transition-colors">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a855f7] to-[#f59e0b] flex items-center justify-center text-white font-bold">{friend.username[0]}</div>
        {friend.is_online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0d0d14]" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-[#f1f5f9] truncate">{friend.username}</h4>
          <Badge variant="default" size="sm">Rank #{friend.rank}</Badge>
        </div>
        <p className={cn("text-xs", friend.is_online ? "text-green-500" : "text-[#64748b]")}>{lastSeenText} • {friend.win_rate}% WR</p>
      </div>
      <div className="flex gap-2">
        <Link href={`/chat`}><Button variant="ghost" size="sm" className="w-8 h-8 p-0"><MessageCircle className="w-4 h-4" /></Button></Link>
        <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-red-500 hover:text-red-400"><UserX className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}

function formatLastSeen(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
