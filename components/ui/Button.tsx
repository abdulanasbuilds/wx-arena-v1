"use client";

import { motion } from "framer-motion";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "@/components/ui/Spinner";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-purple-500 text-white border border-purple-500",
    "hover:bg-purple-600 hover:border-purple-600",
    "focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d14]",
    "disabled:bg-purple-500/40 disabled:border-purple-500/40",
  ].join(" "),

  secondary: [
    "bg-[#16213e] text-[#f1f5f9] border border-[#2a2a4e]",
    "hover:bg-[#1e2a4a] hover:border-[#3a3a6e]",
    "focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d14]",
    "disabled:bg-[#16213e]/50 disabled:border-[#2a2a4e]/50",
  ].join(" "),

  outline: [
    "bg-transparent text-purple-400 border border-purple-500",
    "hover:bg-purple-500/10 hover:text-purple-300",
    "focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d14]",
    "disabled:text-purple-500/40 disabled:border-purple-500/40",
  ].join(" "),

  ghost: [
    "bg-transparent text-[#94a3b8] border border-transparent",
    "hover:bg-[#1a1a2e] hover:text-[#f1f5f9]",
    "focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d14]",
    "disabled:text-[#94a3b8]/40",
  ].join(" "),

  danger: [
    "bg-red-500 text-white border border-red-500",
    "hover:bg-red-600 hover:border-red-600",
    "focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d14]",
    "disabled:bg-red-500/40 disabled:border-red-500/40",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2.5 rounded-xl",
};

const spinnerSizeMap: Record<ButtonSize, "sm" | "md"> = {
  sm: "sm",
  md: "sm",
  lg: "md",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileTap={isDisabled ? undefined : { scale: 0.96 }}
      transition={{ duration: 0.1 }}
      disabled={isDisabled}
      className={cn(
        "relative inline-flex items-center justify-center font-medium",
        "transition-colors duration-150 outline-none select-none",
        "disabled:cursor-not-allowed disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size={spinnerSizeMap[size]} className="opacity-80" />
        </span>
      )}
      <span
        className={cn(
          "inline-flex items-center gap-inherit",
          isLoading && "invisible",
        )}
      >
        {children}
      </span>
    </motion.button>
  );
}
