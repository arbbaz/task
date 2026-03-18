import type { ReactNode } from "react";
import AppShellClient from "@/features/layout/components/AppShellClient";

interface AppShellProps {
  children: ReactNode;
  contentClassName?: string;
}

export default function AppShell({ children, contentClassName }: AppShellProps) {
  return <AppShellClient contentClassName={contentClassName}>{children}</AppShellClient>;
}
