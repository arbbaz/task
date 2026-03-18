"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "@/i18n/routing";

type Phase = "idle" | "starting" | "finishing";

export default function RouteProgress() {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);
  const navigatingRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [width, setWidth] = useState(0);

  const start = () => {
    navigatingRef.current = true;
    setPhase("starting");
    setWidth(12);
    globalThis.setTimeout(() => setWidth(72), 120);
  };

  const finish = () => {
    setPhase("finishing");
    setWidth(100);
    globalThis.setTimeout(() => {
      setPhase("idle");
      setWidth(0);
      navigatingRef.current = false;
    }, 260);
  };

  // Start progress immediately on internal link clicks (feels much smoother).
  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as Element | null;
      const anchor = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href") || "";
      if (!href || href.startsWith("#")) return;
      if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) return;

      // If navigating to a different internal route, kick off progress.
      if (href !== pathname && !navigatingRef.current) {
        start();
      }
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [pathname]);

  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = pathname;
    if (prev === null || prev === pathname) return;

    // Route committed → finish the bar quickly.
    if (navigatingRef.current) {
      finish();
    } else {
      // Back/forward or programmatic nav
      start();
      globalThis.setTimeout(() => finish(), 220);
    }
  }, [pathname]);

  const visible = phase !== "idle";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        pointerEvents: "none",
        zIndex: 9999,
        opacity: visible ? 1 : 0,
        transition: "opacity 120ms ease-out",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          background: "var(--color-primary, #2563eb)",
          boxShadow: "0 0 12px rgba(37, 99, 235, 0.35)",
          transition:
            phase === "finishing"
              ? "width 180ms ease-out"
              : "width 260ms ease-out",
          willChange: "width",
        }}
      />
    </div>
  );
}

