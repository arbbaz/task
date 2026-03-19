"use client";

import dynamic from "next/dynamic";

const CookieConsent = dynamic(
  () => import("@/shared/components/feedback/CookieConsent"),
  { ssr: false }
);

const AnalyticsTracker = dynamic(
  () => import("@/shared/components/analytics/AnalyticsTracker"),
  { ssr: false }
);

export default function DeferredExtras() {
  return (
    <>
      <CookieConsent />
      <AnalyticsTracker />
    </>
  );
}
