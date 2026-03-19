"use client";

import { useTrendingOverviewQuery } from "@/features/trending/hooks/useTrendingOverviewQuery";
import { truncateWithEllipsis } from "@/shared/utils/text";

export interface SidebarTopRatedCard {
  title: string;
  product: {
    name: string;
    score: string;
    reviews: string;
    companies: string;
    badge: { text: string; tone: "primary" | "accent" | "warning" };
    description: string;
    theme: "dark" | "light";
    hasVerify?: boolean;
  };
}

export function useTopRatedCards() {
  const { data } = useTrendingOverviewQuery();
  const source =
    data?.topRatedThisWeek?.length
      ? data.topRatedThisWeek
      : data?.trendingNow?.length
        ? data.trendingNow
        : [];

  return source.slice(0, 2).map((item, index) => ({
    title: "Top rated this week",
    product: {
      name: truncateWithEllipsis(item.name, 26),
      score: `${item.averageScore.toFixed(1)}/10`,
      reviews: `${item.reviewCount} Reviews`,
      companies: "1",
      badge:
        index === 0
          ? { text: "Rising", tone: "accent" }
          : { text: "New", tone: "warning" },
      description: truncateWithEllipsis(item.description || item.name, 92),
      theme: index === 0 ? "dark" : "light",
      hasVerify: index === 1,
    },
  }));
}
