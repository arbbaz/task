"use client";

import { useCallback } from "react";
import { useToast } from "@/lib/contexts/ToastContext";

export function useProfileShare(username: string) {
  const { showToast } = useToast();

  return useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = `${username} – Profile`;

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, url });
        showToast("Profile link shared.", "success");
      } else {
        await navigator.clipboard.writeText(url);
        showToast("Profile link copied to clipboard.", "success");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        showToast("Failed to share profile.", "error");
      }
    }
  }, [showToast, username]);
}
