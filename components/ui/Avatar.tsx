import { cn } from "@/lib/utils/cn";
import { Crown } from "lucide-react";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string;
  username: string;
  size?: AvatarSize;
  isPro?: boolean;
  className?: string;
}

const sizeMap: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const sizeTailwind: Record<AvatarSize, string> = {
  xs: "w-6 h-6 text-[9px]",
  sm: "w-8 h-8 text-[11px]",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-xl",
};

const badgeSizeTailwind: Record<AvatarSize, string> = {
  xs: "w-3 h-3 -top-0.5 -right-0.5",
  sm: "w-3.5 h-3.5 -top-0.5 -right-0.5",
  md: "w-4 h-4 -top-0.5 -right-0.5",
  lg: "w-5 h-5 -top-0.5 -right-0.5",
  xl: "w-6 h-6 -top-0.5 -right-0.5",
};

const badgeIconSize: Record<AvatarSize, number> = {
  xs: 6,
  sm: 7,
  md: 8,
  lg: 10,
  xl: 12,
};

// Deterministic gradient picker based on username
const gradients = [
  "from-purple-600 to-indigo-600",
  "from-pink-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-amber-500 to-orange-600",
  "from-violet-600 to-purple-700",
  "from-rose-500 to-pink-600",
];

function getGradient(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 31 + username.charCodeAt(i)) >>> 0;
  }
  return gradients[hash % gradients.length] ?? gradients[0]!;
}

function getInitials(username: string): string {
  const trimmed = username.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export function Avatar({
  src,
  username,
  size = "md",
  isPro = false,
  className,
}: AvatarProps) {
  const px = sizeMap[size];
  const initials = getInitials(username);
  const gradient = getGradient(username);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0",
        sizeTailwind[size],
        className,
      )}
      aria-label={username}
    >
      {src ? (
        <img
          src={src}
          alt={username}
          width={px}
          height={px}
          className={cn(
            "rounded-full object-cover w-full h-full",
            "ring-2 ring-[#2a2a4e]",
          )}
          draggable={false}
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex items-center justify-center",
            "rounded-full w-full h-full",
            "bg-linear-to-br",
            gradient,
            "ring-2 ring-[#2a2a4e]",
            "font-semibold text-white select-none leading-none",
          )}
        >
          {initials}
        </span>
      )}

      {isPro && (
        <span
          aria-label="Pro member"
          className={cn(
            "absolute flex items-center justify-center",
            "rounded-full z-10",
            "bg-linear-to-br from-amber-400 to-yellow-500",
            "ring-2 ring-[#0d0d14]",
            badgeSizeTailwind[size],
          )}
        >
          <Crown
            size={badgeIconSize[size]}
            strokeWidth={2.5}
            className="text-amber-900"
            aria-hidden="true"
          />
        </span>
      )}
    </span>
  );
}
