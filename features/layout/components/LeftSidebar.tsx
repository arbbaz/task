"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { sidebarMenuKeys, languageItems } from "@/shared/data/uiContent";
import AlertCard from "@/shared/components/feedback/AlertCard";
import SidebarMenuItem from "@/shared/components/layout/SidebarMenuItem";
import Separator from "@/shared/components/ui/Separator";
import { trendingApi } from "@/features/trending/api/client";
import { truncateWithEllipsis } from "@/shared/utils/text";

interface SidebarAlert {
  type: "trending";
  title: string;
  content: string;
  bgColor: string;
  textColor: string;
  height: string;
  padding: string;
  hasScore: boolean;
}

export default function LeftSidebar() {
  const t = useTranslations();
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [sidebarAlerts, setSidebarAlerts] = useState<SidebarAlert[]>([]);

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
      if (response.error || !response.data?.trendingNow?.length) {
        return;
      }

      const trendingItem = response.data.trendingNow[0];
      setSidebarAlerts([
        {
          type: "trending",
          title: t("alerts.trendingNow"),
          content: truncateWithEllipsis(trendingItem.name, 42),
          bgColor: "bg-primary",
          textColor: "text-white",
          height: "h-14",
          padding: "px-3 mt-16 py-2",
          hasScore: false,
        },
      ]);
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
    <aside className="sidebar-left sidebar-border-right">
      {sidebarAlerts.map((alert, index) => (
        <AlertCard key={alert.type} alert={alert} index={index} />
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
    </aside>
  );
}
