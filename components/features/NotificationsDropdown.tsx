"use client";

import { useState, useEffect } from "react";
import { Bell, X, Trophy, UserPlus, MessageCircle, Swords, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  type: "match_won" | "match_lost" | "friend_request" | "message" | "match_ready" | "tournament";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    type: "match_won",
    title: "Match Won!",
    message: "You defeated DragonKick and won 500 points",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
    action_url: "/matches",
  },
  {
    id: "notif-2",
    type: "friend_request",
    title: "New Friend Request",
    message: "VortexSniper wants to be your friend",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
    action_url: "/friends",
  },
  {
    id: "notif-3",
    type: "message",
    title: "New Message",
    message: "SteelNova: "GG! Rematch tomorrow?"",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    read: true,
    action_url: "/chat",
  },
  {
    id: "notif-4",
    type: "tournament",
    title: "Tournament Starting",
    message: "Weekend Warrior Cup starts in 30 minutes",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read: true,
    action_url: "/tournaments",
  },
];

const icons = {
  match_won: Trophy,
  match_lost: Swords,
  friend_request: UserPlus,
  message: MessageCircle,
  match_ready: Swords,
  tournament: Trophy,
};

const colors = {
  match_won: "text-green-500 bg-green-500/20",
  match_lost: "text-red-500 bg-red-500/20",
  friend_request: "text-[#a855f7] bg-[#a855f7]/20",
  message: "text-blue-500 bg-blue-500/20",
  match_ready: "text-yellow-500 bg-yellow-500/20",
  tournament: "text-[#f59e0b] bg-[#f59e0b]/20",
};

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative w-10 h-10 p-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 bg-[#0d0d14] border border-[#2a2a4e] rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a4e]">
                <h3 className="font-semibold text-[#f1f5f9]">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#a855f7] hover:text-[#c084fc] transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-[#64748b]">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const Icon = icons[notification.type];
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "flex items-start gap-3 p-4 hover:bg-[#1a1a2e] transition-colors border-b border-[#2a2a4e] last:border-0 cursor-pointer",
                          !notification.read && "bg-[#1a1a2e]/50"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            colors[notification.type]
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                "font-medium text-sm",
                                notification.read ? "text-[#94a3b8]" : "text-[#f1f5f9]"
                              )}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-[#a855f7] rounded-full shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-[#64748b] mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-[#64748b] mt-1">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-[#2a2a4e] text-center">
                <button className="text-xs text-[#64748b] hover:text-[#94a3b8] transition-colors">
                  View all notifications
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
