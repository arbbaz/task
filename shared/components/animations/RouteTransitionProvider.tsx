"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "@/i18n/routing";

export default function RouteTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.26, ease: [0.22, 1, 0.36, 1] }
        }
        style={{ willChange: reduceMotion ? undefined : "transform, opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

