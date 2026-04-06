"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// ─── Schema ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFields = z.infer<typeof loginSchema>;

// ─── Types ───────────────────────────────────────────────────────────────────

interface FieldErrors {
  email?: string;
  password?: string;
}

interface FormState {
  values: LoginFields;
  fieldErrors: FieldErrors;
  generalError: string;
  isSubmitting: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();

  const [state, setState] = useState<FormState>({
    values: { email: "", password: "" },
    fieldErrors: {},
    generalError: "",
    isSubmitting: false,
  });

  function setField(field: keyof LoginFields, value: string) {
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, [field]: value },
      fieldErrors: { ...prev.fieldErrors, [field]: undefined },
      generalError: "",
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Client-side validation
    const result = loginSchema.safeParse(state.values);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof LoginFields;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setState((prev) => ({ ...prev, fieldErrors }));
      return;
    }

    setState((prev) => ({ ...prev, isSubmitting: true, generalError: "" }));

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

    if (error) {
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        generalError: "Invalid email or password. Please try again.",
      }));
      return;
    }

    router.push("/dashboard");
  }

  const { values, fieldErrors, generalError, isSubmitting } = state;

  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#f1f5f9] tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-[#94a3b8]">
          Sign in to your WX Arena account
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
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={(e) => setField("email", e.target.value)}
          error={fieldErrors.email}
          disabled={isSubmitting}
        />

        <div className="flex flex-col gap-1.5">
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={values.password}
            onChange={(e) => setField("password", e.target.value)}
            error={fieldErrors.password}
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <a
              href="#"
              className="text-xs text-[#94a3b8] hover:text-[#a855f7] transition-colors duration-150"
            >
              Forgot password?
            </a>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full mt-1"
        >
          Sign in
        </Button>
      </form>

      {/* Divider */}
      <hr className="divider" />

      {/* Register link */}
      <p className="text-center text-sm text-[#94a3b8]">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-[#a855f7] hover:text-[#c084fc] transition-colors duration-150"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
