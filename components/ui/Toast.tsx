"use client";

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = `toast-${++counterRef.current}`;
      const item: ToastItem = { id, type, message, duration };
      setToasts((prev) => [...prev, item]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// ─── Icon map ─────────────────────────────────────────────────────────────────

const iconMap: Record<ToastType, ReactNode> = {
  success: <CheckCircle size={16} strokeWidth={2.5} aria-hidden="true" />,
  error: <XCircle size={16} strokeWidth={2.5} aria-hidden="true" />,
  warning: <AlertTriangle size={16} strokeWidth={2.5} aria-hidden="true" />,
  info: <Info size={16} strokeWidth={2.5} aria-hidden="true" />,
};

const colorMap: Record<
  ToastType,
  { bar: string; icon: string; bg: string; border: string }
> = {
  success: {
    bar: "bg-green-500",
    icon: "text-green-400",
    bg: "bg-[#1a1a2e]",
    border: "border-green-500/30",
  },
  error: {
    bar: "bg-red-500",
    icon: "text-red-400",
    bg: "bg-[#1a1a2e]",
    border: "border-red-500/30",
  },
  warning: {
    bar: "bg-amber-500",
    icon: "text-amber-400",
    bg: "bg-[#1a1a2e]",
    border: "border-amber-500/30",
  },
  info: {
    bar: "bg-purple-500",
    icon: "text-purple-400",
    bg: "bg-[#1a1a2e]",
    border: "border-purple-500/30",
  },
};

// ─── Individual Toast ─────────────────────────────────────────────────────────

interface ToastProps {
  type: ToastType;
  message: string;
  onDismiss: () => void;
  className?: string;
}

export function Toast({ type, message, onDismiss, className }: ToastProps) {
  const colors = colorMap[type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={cn(
        "relative flex items-start gap-3 overflow-hidden",
        "w-full max-w-sm rounded-xl border px-4 py-3",
        "shadow-xl shadow-black/40",
        colors.bg,
        colors.border,
        className,
      )}
    >
      {/* Left colour bar */}
      <span
        className={cn(
          "absolute left-0 top-0 h-full w-0.75 rounded-l-xl",
          colors.bar,
        )}
        aria-hidden="true"
      />

      {/* Icon */}
      <span className={cn("mt-0.5 shrink-0", colors.icon)}>
        {iconMap[type]}
      </span>

      {/* Message */}
      <p className="flex-1 text-sm text-[#f1f5f9] leading-snug pr-1">
        {message}
      </p>

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className={cn(
          "shrink-0 mt-0.5 flex items-center justify-center",
          "w-5 h-5 rounded-md text-[#64748b]",
          "hover:text-[#f1f5f9] hover:bg-[#2a2a4e]",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-purple-500",
        )}
      >
        <X size={13} strokeWidth={2.5} aria-hidden="true" />
      </button>
    </div>
  );
}

// ─── Toast Container ──────────────────────────────────────────────────────────

interface ToastContainerProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div
      aria-label="Notifications"
      className={cn(
        "fixed bottom-5 right-5 z-9999",
        "flex flex-col-reverse gap-2.5",
        "pointer-events-none",
      )}
    >
      <AnimatePresence initial={false} mode="sync">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 56, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 56, scale: 0.92 }}
            transition={{
              duration: 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="pointer-events-auto"
          >
            <Toast
              type={toast.type}
              message={toast.message}
              onDismiss={() => removeToast(toast.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
