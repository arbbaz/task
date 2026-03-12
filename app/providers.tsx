'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/lib/contexts/ToastContext';
import { AuthProvider } from '@/lib/contexts/AuthContext';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
