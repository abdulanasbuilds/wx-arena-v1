import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    template: "%s | WX ARENA",
    default: "WX ARENA — Auth",
  },
  description: "Skill-based competitive gaming — sign in or create your account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#0d0d14] flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Ambient background glows */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#a855f7] opacity-[0.07] blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#7c3aed] opacity-[0.06] blur-[90px]" />
      </div>

      {/* Brand header */}
      <div className="relative z-10 mb-8 flex flex-col items-center gap-3">
        <Link
          href="/"
          className="group flex items-center gap-2 select-none"
          aria-label="WX Arena home"
        >
          {/* Logo mark */}
          <div className="w-10 h-10 rounded-xl bg-[#a855f715] border border-[#a855f740] flex items-center justify-center transition-all duration-200 group-hover:border-[#a855f7] group-hover:shadow-[0_0_16px_2px_#a855f730]">
            <span className="text-lg font-black gradient-text leading-none">W</span>
          </div>

          {/* Wordmark */}
          <span className="text-2xl font-extrabold tracking-[0.12em] gradient-text">
            WX ARENA
          </span>
        </Link>

        <p className="text-sm text-[#94a3b8] tracking-wide font-medium">
          Skill-based competitive gaming
        </p>
      </div>

      {/* Auth card container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#1a1a2e] border border-[#1e293b] rounded-2xl shadow-[0_8px_40px_0_#00000070] overflow-hidden">
          {/* Top accent bar */}
          <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#a855f7] to-transparent" />

          {/* Content */}
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            {children}
          </div>
        </div>

        {/* Back to home link */}
        <p className="mt-6 text-center text-sm text-[#475569]">
          <Link
            href="/"
            className="hover:text-[#94a3b8] transition-colors duration-150 inline-flex items-center gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
