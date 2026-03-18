"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { usePathname } from "@/i18n/routing";
import { alerts, sidebarMenuKeys, languageItems } from "@/shared/data/uiContent";
import AlertCard from "@/shared/components/feedback/AlertCard";
import SidebarMenuItem from "@/shared/components/layout/SidebarMenuItem";
import Separator from "@/shared/components/ui/Separator";
import { trendingApi } from "@/features/trending/api/client";
import { truncateWithEllipsis } from "@/shared/utils/text";

type SidebarAlert = (typeof alerts)[number];

export default function LeftSidebar() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const controls = useAnimationControls();
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [sidebarAlerts, setSidebarAlerts] = useState<SidebarAlert[]>(alerts);

  useEffect(() => {
    if (reduceMotion) return;
    void controls.start({
      opacity: [0.6, 1],
      x: [-6, 0],
      transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
    });
  }, [pathname, reduceMotion, controls]);

  useEffect(() => {
    let isMounted = true;
    let timerId: number | ReturnType<typeof setTimeout> | null = null;
    const idleWindow = window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number }
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    const loadTrending = async () => {
      const response = await trendingApi.get({ period: 'week', limit: 1 });
      if (!isMounted) {
        return;
      }
      if (response.error || !response.data) {
        return;
      }

      const data = response.data;
      const trendingItem =
        data.trendingNow?.[0] ?? data.topRatedThisWeek?.[0] ?? null;
      if (!trendingItem) return;

      setSidebarAlerts((prev) =>
        prev.map((item) =>
          item.type === "trending"
            ? {
                ...item,
                content: truncateWithEllipsis(trendingItem.name, 42),
              }
            : item
        )
      );
    };

    if (typeof idleWindow.requestIdleCallback === "function") {
      const id = idleWindow.requestIdleCallback(() => {
        void loadTrending();
      }, { timeout: 1200 });
      timerId = id;
    } else {
      timerId = globalThis.setTimeout(() => {
        void loadTrending();
      }, 400);
    }

    return () => {
      isMounted = false;
      if (timerId != null) {
        if (
          typeof timerId === "number" &&
          typeof idleWindow.cancelIdleCallback === "function"
        ) {
          idleWindow.cancelIdleCallback(timerId);
        } else {
          globalThis.clearTimeout(timerId);
        }
      }
    };
  }, [t]);

  return (
    <motion.aside
      className="sidebar-left sidebar-border-right"
      initial={reduceMotion ? false : { opacity: 0, x: -8 }}
      animate={reduceMotion ? { opacity: 1 } : controls}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      style={{ willChange: reduceMotion ? undefined : "transform, opacity" }}
    >
      {sidebarAlerts.map((alert, index) => (
        <AlertCard key={`${alert.type}-${index}`} alert={alert} index={index} />
      ))}
      {sidebarMenuKeys.map((key) => (
        <SidebarMenuItem
          key={key}
          item={t(`sidebar.${key}`)}
          isActive={activeItem === key}
          onClick={() => setActiveItem(key)}
        />
      ))}
      <Separator />
      {languageItems.map((item) => (
        <SidebarMenuItem
          key={item}
          item={t("sidebar.language")}
          isActive={activeItem === item}
          onClick={() => setActiveItem(item)}
        />
      ))}
    </motion.aside>
  );
}
