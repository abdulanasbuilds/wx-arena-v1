"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Gamepad2,
  Trophy,
  BarChart3,
  MessageSquare,
  Wallet,
  Gift,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Matches", href: "/matches", icon: Gamepad2 },
  { label: "Tournaments", href: "/tournaments", icon: Trophy },
  { label: "Leaderboard", href: "/leaderboard", icon: BarChart3 },
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Rewards", href: "/rewards", icon: Gift },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard" || pathname === "/"
      : pathname.startsWith(href);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col",
        "fixed left-0 top-0 z-40 h-full w-64",
        "bg-[#0d0d14] border-r border-[#1a1a2e]",
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[#1a1a2e] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#a855f7] flex items-center justify-center shrink-0">
          <span className="text-white font-black text-sm leading-none">WX</span>
        </div>
        <span className="text-[#f1f5f9] font-bold text-lg tracking-wide leading-none">
          WX ARENA
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg",
                    "text-sm font-medium transition-colors duration-150",
                    active
                      ? [
                          "bg-[#1a1a2e] text-[#a855f7]",
                          "border-l-2 border-[#a855f7]",
                          // compensate left border so text doesn't shift
                          "-ml-px pl-2.75",
                        ]
                      : [
                          "text-[#94a3b8] border-l-2 border-transparent -ml-px",
                          "pl-2.75",
                          "hover:text-[#f1f5f9] hover:bg-[#1a1a2e]/50",
                        ],
                  )}
                >
                  <Icon
                    size={18}
                    className={cn(
                      "shrink-0 transition-colors duration-150",
                      active
                        ? "text-[#a855f7]"
                        : "text-[#64748b] group-hover:text-[#f1f5f9]",
                    )}
                  />
                  <span className="truncate">{label}</span>

                  {/* Active glow dot */}
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#a855f7] shadow-[0_0_6px_#a855f7] shrink-0" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profile footer */}
      <div className="shrink-0 px-3 py-4 border-t border-[#1a1a2e]">
        <Link
          href="/profile/me"
          className={cn(
            "group flex items-center gap-3 px-3 py-2.5 rounded-lg",
            "text-sm font-medium transition-colors duration-150",
            pathname.startsWith("/profile")
              ? "bg-[#1a1a2e] text-[#a855f7]"
              : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1a1a2e]/50",
          )}
        >
          {/* Avatar placeholder */}
          <div
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
              "bg-[#2a2a4e] border border-[#2a2a4e]",
              pathname.startsWith("/profile") && "border-[#a855f7]/50",
            )}
          >
            <User
              size={14}
              className={cn(
                pathname.startsWith("/profile")
                  ? "text-[#a855f7]"
                  : "text-[#64748b] group-hover:text-[#f1f5f9]",
              )}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-xs font-semibold leading-tight">
              My Profile
            </span>
            <span className="text-[10px] text-[#64748b] leading-tight truncate">
              View account
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
