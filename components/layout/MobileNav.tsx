"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gamepad2, Trophy, Wallet, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Matches", href: "/matches", icon: Gamepad2 },
  { label: "Tournaments", href: "/tournaments", icon: Trophy },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Profile", href: "/profile/me", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-[#0d0d14] border-t border-[#1a1a2e]",
        "flex md:hidden",
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex w-full">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/" || pathname.startsWith("/dashboard")
              : pathname.startsWith(href);

          return (
            <li key={href} className="flex-1">
              <motion.div whileTap={{ scale: 0.82 }} className="w-full">
                <Link
                  href={href}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-1",
                    "py-2 px-1 w-full select-none",
                    "transition-colors duration-150",
                    isActive ? "text-[#a855f7]" : "text-[#64748b]",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* Active indicator dot */}
                  <span
                    className={cn(
                      "absolute top-1 h-1 w-1 rounded-full bg-[#a855f7]",
                      "transition-opacity duration-150",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden="true"
                  />

                  <Icon size={20} className="shrink-0" />

                  <span
                    className={cn(
                      "text-[10px] font-medium leading-none tracking-wide",
                    )}
                  >
                    {label}
                  </span>
                </Link>
              </motion.div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
