"use client";

import { useId } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends ComponentPropsWithoutRef<"input"> {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
}

export function Input({
  label,
  error,
  hint,
  className,
  id,
  disabled,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const ariaDescribedBy =
    [error ? errorId : null, hint && !error ? hintId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "text-sm font-medium text-[#f1f5f9]",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={ariaDescribedBy}
        className={cn(
          // Base
          "w-full rounded-xl px-3 py-2.5 text-sm text-[#f1f5f9]",
          "bg-[#0d0d14] border border-[#2a2a4e]",
          "placeholder:text-[#64748b]",
          "outline-none transition-colors duration-150",
          // Focus
          "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30",
          // Hover (non-disabled, non-error)
          !error && "hover:border-[#3a3a6e]",
          // Error state
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/30",
          // Disabled
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          className,
        )}
        {...props}
      />

      {error && (
        <p id={errorId} className="text-xs text-red-400 mt-0.5">
          {error}
        </p>
      )}

      {hint && !error && (
        <p id={hintId} className="text-xs text-[#94a3b8] mt-0.5">
          {hint}
        </p>
      )}
    </div>
  );
}
