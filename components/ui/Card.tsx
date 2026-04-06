import { motion } from "framer-motion";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Card({ className, children, onClick, ...props }: CardProps) {
  const isClickable = typeof onClick === "function";

  if (isClickable) {
    return (
      <motion.div
        onClick={onClick}
        whileHover={{ scale: 1.015, borderColor: "#3a3a6e" }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={cn(
          "bg-[#1a1a2e] border border-[#2a2a4e] rounded-xl p-4",
          "cursor-pointer outline-none select-none",
          "focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d14]",
          "transition-colors duration-150",
          className,
        )}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.div>)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        "bg-[#1a1a2e] border border-[#2a2a4e] rounded-xl p-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
