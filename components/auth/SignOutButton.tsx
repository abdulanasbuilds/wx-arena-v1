"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";

interface SignOutButtonProps {
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
  redirectTo?: string;
}

export function SignOutButton({
  variant = "ghost",
  size = "md",
  className = "",
  showIcon = true,
  redirectTo = "/login",
}: SignOutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    setIsLoading(false);

    if (error) {
      console.error("Sign out error:", error);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSignOut}
      isLoading={isLoading}
      className={className}
    >
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      Sign out
    </Button>
  );
}
