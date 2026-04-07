"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  points: number;
  total_matches: number;
  wins: number;
  losses: number;
  win_rate: number;
  rank: number;
  streak: number;
  is_verified: boolean;
  is_pro: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    error: null,
  });

  const supabase = createClient();

  // Fetch user profile
  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data as UserProfile;
    },
    [supabase]
  );

  // Refresh auth state
  const refreshAuth = useCallback(async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: sessionError.message,
        }));
        return;
      }

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({
          user: session.user,
          profile,
          session,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          profile: null,
          session: null,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Auth error",
      }));
    }
  }, [supabase, fetchProfile]);

  // Sign out
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setState((prev) => ({ ...prev, error: error.message }));
      return;
    }
    setState({
      user: null,
      profile: null,
      session: null,
      isLoading: false,
      error: null,
    });
  }, [supabase]);

  // Subscribe to auth changes
  useEffect(() => {
    refreshAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({
          user: session.user,
          profile,
          session,
          isLoading: false,
          error: null,
        });
      } else if (event === "SIGNED_OUT") {
        setState({
          user: null,
          profile: null,
          session: null,
          isLoading: false,
          error: null,
        });
      } else if (event === "USER_UPDATED" && session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState((prev) => ({
          ...prev,
          user: session.user,
          profile,
          session,
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile, refreshAuth]);

  return {
    ...state,
    signOut,
    refreshAuth,
    isAuthenticated: !!state.user,
  };
}

// Simpler hook that just returns user data
export function useUser() {
  const { user, profile, isLoading } = useAuth();
  return { user, profile, isLoading };
}

// Hook for protected routes
export function useRequireAuth(redirectTo = "/login") {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = redirectTo;
    }
  }, [user, isLoading, redirectTo]);

  return { user, isLoading };
}
