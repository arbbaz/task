"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
const Header = dynamic(() => import("@/features/header/components/Header"), {
  loading: () => (
    <header
      className="min-h-[52px] sm:min-h-[60px] w-full overflow-visible border-b border-border"
      aria-hidden
    />
  ),
});

const LeftSidebar = dynamic(() => import("@/features/layout/components/LeftSidebar"), {
  ssr: false,
  loading: () => (
    <aside className="sidebar-left sidebar-border-right hidden lg:block lg:min-w-[250px]" aria-hidden />
  ),
});

const RightSidebar = dynamic(() => import("@/features/layout/components/RightSidebar"), {
  ssr: false,
  loading: () => (
    <aside className="sidebar-border-left hidden lg:block lg:min-w-[340px]" aria-hidden />
  ),
});

const Footer = dynamic(() => import("@/features/layout/components/Footer"), {
  loading: () => <footer className="border-t border-border-separator pb-0 pt-8 sm:pt-16 w-full" aria-hidden />,
});

export default function AppShellClient({
  children,
  contentClassName,
}: {
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <div className="bg-bg-white text-foreground">
      <Header />
      <div className="page-container">
        <div className="page-main-wrap">
          <main className="main-grid">
            <div className="contents">
              <LeftSidebar />
              <section className={contentClassName ?? "content-section"}>{children}</section>
              <RightSidebar />
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
