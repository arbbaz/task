"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { authApi } from "@/features/auth/api/client";
import { useToast } from "@/lib/contexts/ToastContext";
import type { UserProfile } from "@/lib/types";

function isAuthFailureMessage(message: string): boolean {
  return /unauthorized|authentication required/i.test(message);
}

// Map NextAuth session.user to UserProfile (session is source of truth when authenticated)
function sessionUserToProfile(sessionUser: {
  id?: string;
  email?: string | null;
  username?: string;
  avatar?: string | null;
  verified?: boolean;
  reputation?: number;
  bio?: string | null;
}): UserProfile | null {
  if (!sessionUser?.id || !sessionUser?.username) return null;
  return {
    id: sessionUser.id,
    email: sessionUser.email ?? undefined,
    username: sessionUser.username,
    avatar: sessionUser.avatar ?? undefined,
    verified: sessionUser.verified ?? false,
    bio: sessionUser.bio ?? undefined,
    reputation: sessionUser.reputation ?? 0,
  };
}

interface AuthContextValue {
  isLoggedIn: boolean;
  user: UserProfile | null;
  refreshAuth: () => Promise<void>;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface InitialAuth {
  isLoggedIn: boolean;
  user: UserProfile | null;
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [fallbackAuth, setFallbackAuth] = useState<InitialAuth | null>(null);
  const { showToast } = useToast();

  const fetchFallbackAuth = useCallback(async () => {
    const response = await authApi.me();
    setFallbackAuth({
      isLoggedIn: !!response.data?.user,
      user: response.data?.user ?? null,
    });
    if (response.error && !isAuthFailureMessage(response.error)) {
      showToast(response.error, "error");
    }
  }, [showToast]);

  const refreshAuth = useCallback(async () => {
    await fetchFallbackAuth();
  }, [fetchFallbackAuth]);

  // Fetch backend cookie auth once after NextAuth resolves unauthenticated.
  useEffect(() => {
    if (status !== "unauthenticated" || fallbackAuth != null) return;

    let cancelled = false;
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let handle: number | ReturnType<typeof setTimeout> | null = null;

    const run = () => {
      if (cancelled) return;
      void fetchFallbackAuth();
    };

    // Defer this network request so first paint / hydration stays smooth.
    if (typeof idleWindow.requestIdleCallback === "function") {
      handle = idleWindow.requestIdleCallback(run, { timeout: 1500 });
    } else {
      handle = globalThis.setTimeout(run, 600);
    }

    return () => {
      cancelled = true;
      if (handle != null) {
        if (typeof handle === "number" && typeof idleWindow.cancelIdleCallback === "function") {
          idleWindow.cancelIdleCallback(handle);
        } else {
          globalThis.clearTimeout(handle);
        }
      }
    };
  }, [status, fallbackAuth, fetchFallbackAuth]);

  const resolvedAuth = useMemo(() => {
    if (status === "authenticated" && session?.user) {
      const profile = sessionUserToProfile(
        session.user as Parameters<typeof sessionUserToProfile>[0]
      );
      return {
        isLoggedIn: true,
        user: profile ?? null,
      };
    }

    if (fallbackAuth) {
      return fallbackAuth;
    }

    return { isLoggedIn: false, user: null };
  }, [status, session?.user, fallbackAuth]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: resolvedAuth.isLoggedIn,
        user: resolvedAuth.user,
        refreshAuth,
        isAuthLoading: status === "loading",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
