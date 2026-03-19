"use client";

import { useCallback, useState } from "react";
import type { TabId } from "../components";

export function useProfileTabState(initialTab: TabId = "reviews") {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  const switchTab = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setTimeout(() => {
      const panel = document.getElementById(`panel-${tab}`);
      const firstFocusable = panel?.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (firstFocusable) {
        firstFocusable.focus({ preventScroll: true });
      } else {
        panel?.focus();
      }
    }, 0);
  }, []);

  return { activeTab, switchTab };
}
