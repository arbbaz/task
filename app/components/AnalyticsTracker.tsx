"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getAnalyticsConsent } from "./CookieConsent";
import { getApiBaseUrl } from "@/lib/env";

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function getUtmParams(): { utm_source?: string; utm_medium?: string; utm_campaign?: string } {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const utm_source = params.get("utm_source") ?? undefined;
  const utm_medium = params.get("utm_medium") ?? undefined;
  const utm_campaign = params.get("utm_campaign") ?? undefined;
  return { utm_source, utm_medium, utm_campaign };
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string | null>(null);
  const currentPathRef = useRef<string>("");
  const enteredAtRef = useRef<string>("");

  useEffect(() => {
    if (getAnalyticsConsent() !== true) return;
    const base = getApiBaseUrl();
    if (!base) return;

    if (!sessionIdRef.current) sessionIdRef.current = randomId();
    const sessionId = sessionIdRef.current;
    const path = pathname || "/";
    const now = new Date().toISOString();

    // On route change: send page_leave for previous path first
    const prevPath = currentPathRef.current;
    const prevEntered = enteredAtRef.current;
    if (prevPath && prevEntered && prevPath !== path) {
      const leaveBody = JSON.stringify({
        path: prevPath,
        device: typeof navigator !== "undefined" ? navigator.userAgent : "",
        event: "page_leave",
        sessionId,
        enteredAt: prevEntered,
        leftAt: now,
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`${base}/api/analytics/track`, new Blob([leaveBody], { type: "application/json" }));
      } else {
        fetch(`${base}/api/analytics/track`, { method: "POST", headers: { "Content-Type": "application/json" }, body: leaveBody, keepalive: true }).catch(() => {});
      }
    }

    const enteredAt = now;
    enteredAtRef.current = enteredAt;
    currentPathRef.current = path;

    const referrer = typeof document !== "undefined" ? document.referrer : "";
    const utm = getUtmParams();
    const payload = {
      path,
      device: typeof navigator !== "undefined" ? navigator.userAgent : "",
      timezone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "",
      event: "page_view",
      sessionId,
      enteredAt,
      referrer: referrer || undefined,
      ...utm,
    };
    fetch(`${base}/api/analytics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});

    const sendLeave = (leftAt: string) => {
      const pathToLeave = currentPathRef.current;
      const entered = enteredAtRef.current;
      if (!pathToLeave || !entered) return;
      const body = JSON.stringify({
        path: pathToLeave,
        device: typeof navigator !== "undefined" ? navigator.userAgent : "",
        event: "page_leave",
        sessionId,
        enteredAt: entered,
        leftAt,
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`${base}/api/analytics/track`, new Blob([body], { type: "application/json" }));
      } else {
        fetch(`${base}/api/analytics/track`, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") sendLeave(new Date().toISOString());
    };
    const handlePageHide = () => sendLeave(new Date().toISOString());

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [pathname]);

  return null;
}
