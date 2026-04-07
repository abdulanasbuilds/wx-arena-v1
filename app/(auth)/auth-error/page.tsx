"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "access_denied":
        return "Access was denied. Please try again or use a different sign-in method.";
      case "verification_failed":
        return "Email verification failed. The link may have expired or been used already.";
      case "otp_expired":
        return "Your one-time password has expired. Please request a new one.";
      case "invalid_token":
        return "The authentication token is invalid or has expired.";
      default:
        return "An unexpected authentication error occurred. Please try again.";
    }
  };

  return (
    <div className="flex flex-col gap-6 text-center">
      {/* Error Icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-500"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
      </div>

      {/* Heading */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#f1f5f9] tracking-tight">
          Authentication Error
        </h1>
        <p className="text-sm text-[#94a3b8]">{getErrorMessage(error)}</p>
      </div>

      {/* Recovery Options */}
      <div className="flex flex-col gap-3">
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#a855f7] text-white font-medium hover:bg-[#9333ea] transition-colors"
        >
          Try signing in again
        </Link>

        <Link
          href="/register"
          className="text-sm font-medium text-[#a855f7] hover:text-[#c084fc] transition-colors duration-150"
        >
          Create a new account
        </Link>

        <Link
          href="/forgot-password"
          className="text-sm font-medium text-[#94a3b8] hover:text-[#f1f5f9] transition-colors duration-150"
        >
          Reset your password
        </Link>
      </div>
    </div>
  );
}
