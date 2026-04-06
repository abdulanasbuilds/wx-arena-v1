"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// ─── Schema ──────────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Only letters, numbers, and underscores allowed",
      ),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFields = z.infer<typeof registerSchema>;

// ─── Types ───────────────────────────────────────────────────────────────────

interface FieldErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface FormState {
  values: RegisterFields;
  fieldErrors: FieldErrors;
  generalError: string;
  isSubmitting: boolean;
  isSuccess: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [state, setState] = useState<FormState>({
    values: { username: "", email: "", password: "", confirmPassword: "" },
    fieldErrors: {},
    generalError: "",
    isSubmitting: false,
    isSuccess: false,
  });

  function setField(field: keyof RegisterFields, value: string) {
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, [field]: value },
      fieldErrors: { ...prev.fieldErrors, [field]: undefined },
      generalError: "",
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const result = registerSchema.safeParse(state.values);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof RegisterFields;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setState((prev) => ({ ...prev, fieldErrors }));
      return;
    }

    setState((prev) => ({ ...prev, isSubmitting: true, generalError: "" }));

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: { username: result.data.username },
      },
    });

    if (error) {
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        generalError:
          error.message ?? "Something went wrong. Please try again.",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isSubmitting: false, isSuccess: true }));
  }

  const { values, fieldErrors, generalError, isSubmitting, isSuccess } = state;

  // ─── Success state ──────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-6 py-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#a855f715] border border-[#a855f740]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#a855f7]"
            aria-hidden="true"
          >
            <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            <path d="m16 19 2 2 4-4" />
          </svg>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#f1f5f9]">Check your email</h2>
          <p className="text-sm text-[#94a3b8] max-w-xs mx-auto leading-relaxed">
            We&apos;ve sent a confirmation link to{" "}
            <span className="text-[#f1f5f9] font-medium">{values.email}</span>.
            Click it to activate your account.
          </p>
        </div>

        <hr className="divider w-full" />

        <p className="text-sm text-[#94a3b8]">
          Already confirmed?{" "}
          <Link
            href="/login"
            className="font-medium text-[#a855f7] hover:text-[#c084fc] transition-colors duration-150"
          >
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  // ─── Form state ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#f1f5f9] tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-[#94a3b8]">
          Join WX Arena and start competing
        </p>
      </div>

      {/* General error */}
      {generalError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 shrink-0 text-red-400"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm text-red-400">{generalError}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label="Username"
          type="text"
          autoComplete="username"
          placeholder="your_handle"
          value={values.username}
          onChange={(e) => setField("username", e.target.value)}
          error={fieldErrors.username}
          hint="3–20 characters: letters, numbers, underscores"
          disabled={isSubmitting}
        />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={(e) => setField("email", e.target.value)}
          error={fieldErrors.email}
          disabled={isSubmitting}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={values.password}
          onChange={(e) => setField("password", e.target.value)}
          error={fieldErrors.password}
          hint="Minimum 8 characters"
          disabled={isSubmitting}
        />

        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={values.confirmPassword}
          onChange={(e) => setField("confirmPassword", e.target.value)}
          error={fieldErrors.confirmPassword}
          disabled={isSubmitting}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full mt-1"
        >
          Create account
        </Button>
      </form>

      {/* Divider */}
      <hr className="divider" />

      {/* Login link */}
      <p className="text-center text-sm text-[#94a3b8]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#a855f7] hover:text-[#c084fc] transition-colors duration-150"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
