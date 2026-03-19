"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { alerts, sidebarMenuKeys, languageItems } from "@/shared/data/uiContent";
import AlertCard from "@/shared/components/feedback/AlertCard";
import SidebarMenuItem from "@/shared/components/layout/SidebarMenuItem";
import Separator from "@/shared/components/ui/Separator";
import { useTrendingOverviewQuery } from "@/features/trending/hooks/useTrendingOverviewQuery";
import { truncateWithEllipsis } from "@/shared/utils/text";

type SidebarAlert = (typeof alerts)[number];

export default function LeftSidebar() {
  const t = useTranslations();
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const { data } = useTrendingOverviewQuery();

  const trendingItem = data?.trendingNow?.[0] ?? data?.topRatedThisWeek?.[0] ?? null;
  const sidebarAlerts: SidebarAlert[] = alerts.map((item) =>
    item.type === "trending" && trendingItem
      ? {
          ...item,
          content: truncateWithEllipsis(trendingItem.name, 42),
        }
      : item
  );

  return (
    <aside className="sidebar-left sidebar-border-right">
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
    </aside>
  );
}
