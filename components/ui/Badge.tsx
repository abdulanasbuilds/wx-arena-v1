import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "pro"
  | "verified";

type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children?: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[#2a2a4e] text-[#94a3b8] border border-[#3a3a6e]",
  success: "bg-green-500/15 text-green-400 border border-green-500/30",
  warning: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  danger: "bg-red-500/15 text-red-400 border border-red-500/30",
  info: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  pro: "bg-gradient-to-r from-purple-600 to-violet-500 text-white border border-purple-400/30 shadow-sm shadow-purple-500/20",
  verified: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "h-5 px-1.5 text-[10px] gap-1 rounded-md",
  md: "h-6 px-2 text-xs gap-1 rounded-lg",
};

const iconSizeMap: Record<BadgeSize, number> = {
  sm: 10,
  md: 12,
};

export function Badge({
  variant = "default",
  size = "md",
  children,
  className,
}: BadgeProps) {
  const isVerified = variant === "verified";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        "font-semibold leading-none tracking-wide select-none whitespace-nowrap",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {isVerified && (
        <CheckCircle
          size={iconSizeMap[size]}
          strokeWidth={2.5}
          aria-hidden="true"
          className="shrink-0"
        />
      )}
      {children}
    </span>
  );
}
