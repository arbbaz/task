"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Footer from "@/features/layout/components/Footer";
import Header from "@/features/header/components/Header";

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

export default function AppShellClient({
  children,
  contentClassName,
}: {
  children: ReactNode;
  contentClassName?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="bg-bg-white text-foreground">
      <Header />
      <div className="page-container">
        <div className="page-main-wrap">
          <main className="main-grid">
            <motion.div
              className="contents"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
            >
              <LeftSidebar />
              <section className={contentClassName ?? "content-section"}>{children}</section>
              <RightSidebar />
            </motion.div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
