"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { usePathname } from "@/i18n/routing";
import TopRatedCard from "@/shared/components/layout/TopRatedCard";
import SidebarAuthCard from "@/features/account/components/SidebarAuthCard";
import SidebarHelpPanel from "@/features/account/components/SidebarHelpPanel";
import SidebarPasswordForm from "@/features/account/components/SidebarPasswordForm";
import SidebarProfileForm from "@/features/account/components/SidebarProfileForm";
import { useRightSidebarCards } from "@/features/layout/hooks/useRightSidebarCards";
import { useAuth } from "@/lib/contexts/AuthContext";
import Skeleton from "@/shared/components/ui/Skeleton";

type SidebarView = "help" | "edit-profile" | "change-password";

export default function RightSidebar() {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const controls = useAnimationControls();
  const cards = useRightSidebarCards();
  const [sidebarView, setSidebarView] = useState<SidebarView>("help");

  useEffect(() => {
    if (reduceMotion) return;
    void controls.start({
      opacity: [0.6, 1],
      x: [6, 0],
      transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
    });
  }, [pathname, reduceMotion, controls]);

  return (
    <motion.aside
      className="space-y-3 px-4 sm:px-0 lg:pl-5 sidebar-border-left"
      initial={reduceMotion ? false : { opacity: 0, x: 8 }}
      animate={reduceMotion ? { opacity: 1 } : controls}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      style={{ willChange: reduceMotion ? undefined : "transform, opacity" }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isAuthLoading ? "auth-loading" : isLoggedIn ? `logged-in-${sidebarView}` : "logged-out"}
          layout
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
          }
          style={{ willChange: reduceMotion ? undefined : "transform, opacity" }}
        >
          {isAuthLoading ? (
            <div className="mt-4">
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
          ) : isLoggedIn ? (
            sidebarView === "edit-profile" ? (
              <SidebarProfileForm onBack={() => setSidebarView("help")} />
            ) : sidebarView === "change-password" ? (
              <SidebarPasswordForm onBack={() => setSidebarView("help")} />
            ) : (
              <SidebarHelpPanel
                onEditProfile={() => setSidebarView("edit-profile")}
                onChangePassword={() => setSidebarView("change-password")}
              />
            )
          ) : (
            <SidebarAuthCard onSignupSuccess={() => setSidebarView("edit-profile")} />
          )}
        </motion.div>
      </AnimatePresence>

      {cards.map((card, index) => (
        <TopRatedCard key={`${card.title}-${card.product.name}-${index}`} card={card} index={index} />
      ))}
    </motion.aside>
  );
}
