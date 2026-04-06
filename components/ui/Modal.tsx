"use client";

import {
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<Element | null>(null);

  // Store the element that was focused before the modal opened
  useEffect(() => {
    if (isOpen) {
      previousActiveRef.current = document.activeElement;
    } else {
      // Restore focus on close
      if (
        previousActiveRef.current &&
        previousActiveRef.current instanceof HTMLElement
      ) {
        previousActiveRef.current.focus();
      }
    }
  }, [isOpen]);

  // Auto-focus first focusable element when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const frame = requestAnimationFrame(() => {
      if (!panelRef.current) return;
      const first =
        panelRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
      if (first) {
        first.focus();
      } else {
        panelRef.current.focus();
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  // ESC key closes modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }

      // Focus trap
      if (e.key === "Tab" && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
        );

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onClose],
  );

  // Click-outside closes modal
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center",
            "bg-black/60 backdrop-blur-sm px-4",
          )}
          onClick={handleOverlayClick}
          onKeyDown={handleKeyDown}
          aria-modal="true"
          role="dialog"
          aria-labelledby={title ? "modal-title" : undefined}
        >
          <motion.div
            key="modal-panel"
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            tabIndex={-1}
            className={cn(
              "relative w-full max-w-lg",
              "bg-[#1a1a2e] border border-[#2a2a4e] rounded-2xl",
              "shadow-2xl shadow-black/60",
              "outline-none",
              className,
            )}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#2a2a4e]">
                <h2
                  id="modal-title"
                  className="text-base font-semibold text-[#f1f5f9] leading-snug"
                >
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg",
                    "text-[#64748b] hover:text-[#f1f5f9]",
                    "hover:bg-[#2a2a4e] transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-purple-500 focus-visible:ring-offset-2",
                    "focus-visible:ring-offset-[#1a1a2e]",
                  )}
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
            )}

            {/* Close button when no title */}
            {!title && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                className={cn(
                  "absolute top-4 right-4 z-10",
                  "flex items-center justify-center w-8 h-8 rounded-lg",
                  "text-[#64748b] hover:text-[#f1f5f9]",
                  "hover:bg-[#2a2a4e] transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-purple-500 focus-visible:ring-offset-2",
                  "focus-visible:ring-offset-[#1a1a2e]",
                )}
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            )}

            {/* Body */}
            <div className={cn("p-6", title && "pt-4")}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
