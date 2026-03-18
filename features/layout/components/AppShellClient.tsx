"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Footer from "@/features/layout/components/Footer";
import Header from "@/features/header/components/Header";
import { useAuth } from "@/lib/contexts/AuthContext";
import Skeleton from "@/shared/components/ui/Skeleton";

const LeftSidebar = dynamic(() => import("@/features/layout/components/LeftSidebar"), {
  loading: () => (
    <aside className="sidebar-left sidebar-border-right hidden lg:block lg:min-w-[250px]" aria-hidden />
  ),
});

const RightSidebar = dynamic(() => import("@/features/layout/components/RightSidebar"), {
  loading: () => (
    <aside className="sidebar-border-left hidden lg:block lg:min-w-[340px]" aria-hidden />
  ),
});

function LeftSidebarSkeleton() {
  return (
    <aside className="sidebar-left sidebar-border-right hidden lg:block lg:min-w-[250px]" aria-hidden>
      <div className="p-4 space-y-3">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <div className="pt-2 space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </aside>
  );
}

function RightSidebarSkeleton() {
  return (
    <aside className="hidden lg:block lg:min-w-[340px] sidebar-border-left" aria-hidden>
      <div className="px-4 lg:pl-5">
        <div className="card-base z-10 mt-4 border border-[#E5E5E5] p-5">
          <Skeleton className="h-4 w-32" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-3 w-44" />
          </div>
          <div className="mt-4">
            <Skeleton className="h-10 w-full rounded" />
          </div>
          <div className="mt-5 space-y-3">
            <div>
              <Skeleton className="mb-2 h-3 w-28" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
            <div>
              <Skeleton className="mb-2 h-3 w-24" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
          </div>
          <div className="mt-4">
            <Skeleton className="h-10 w-full rounded" />
          </div>
        </div>
        <div className="sidebar-right-panel">
          <Skeleton className="mx-auto h-3 w-48" />
        </div>
      </div>
    </aside>
  );
}

function ContentSkeleton() {
  return (
    <section className="content-section" aria-hidden>
      <div className="space-y-4">
        <div className="card-base p-5">
          <Skeleton className="h-6 w-48" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card-base p-5 space-y-3">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AppShellClient({
  children,
  contentClassName,
}: {
  children: ReactNode;
  contentClassName?: string;
}) {
  const { isAuthLoading } = useAuth();
  const reduceMotion = useReducedMotion();

  return (
    <div className="bg-bg-white text-foreground">
      <Header />
      <div className="page-container">
        <div className="page-main-wrap">
          <main className="main-grid">
            <AnimatePresence mode="wait" initial={false}>
              {isAuthLoading ? (
                <motion.div
                  key="shell-skeleton"
                  className="contents"
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
                >
                  <LeftSidebarSkeleton />
                  <ContentSkeleton />
                  <RightSidebarSkeleton />
                </motion.div>
              ) : (
                <motion.div
                  key="shell-content"
                  className="contents"
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
                >
                  <LeftSidebar />
                  <section className={contentClassName ?? "content-section"}>{children}</section>
                  <RightSidebar />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

