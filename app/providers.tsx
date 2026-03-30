"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { ToastProvider } from "@/lib/contexts/ToastContext";
import { AuthProvider, type InitialAuth } from "@/lib/contexts/AuthContext";
import QueryProvider from "@/app/QueryProvider";

export default function Providers({
  children,
  session,
  initialAuth,
}: {
  children: React.ReactNode;
  session?: Session | null;
  initialAuth?: InitialAuth | null;
}) {
  return (
    <SessionProvider
      session={session}
      refetchOnWindowFocus={false}
      refetchInterval={0}
    >
      <QueryProvider>
        <ToastProvider>
          <AuthProvider initialAuth={initialAuth}>{children}</AuthProvider>
        </ToastProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
