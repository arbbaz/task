"use client";

import { useTranslations } from "next-intl";
import type { SidebarTopRatedCard } from "@/features/layout/hooks/useTopRatedCards";
import { DotIcon } from "@/shared/components/ui/Icons";

interface TopRatedCardProps {
  card: SidebarTopRatedCard;
  index: number;
}

const badgeToneClass = {
  primary: "sidebar-card-badge-primary",
  accent: "sidebar-card-badge-accent",
  warning: "sidebar-card-badge-warning",
} as const;

const cardThemeClass = {
  dark: {
    card: "sidebar-card-dark",
    body: "sidebar-card-body-dark",
    text: "sidebar-card-text-dark",
    score: "sidebar-card-score-dark",
    divider: "sidebar-card-divider-dark",
  },
  light: {
    card: "sidebar-card-light",
    body: "sidebar-card-body-light",
    text: "sidebar-card-text-light",
    score: "sidebar-card-score-light",
    divider: "sidebar-card-divider-light",
  },
} as const;

export default function TopRatedCard({ card, index }: TopRatedCardProps) {
  const t = useTranslations();
  const theme = cardThemeClass[card.product.theme];

  return (
    <div className={`sidebar-card ${theme.card}`}>
      <div className="sidebar-card-header">
        <h3 className="sidebar-card-title">{card.title || t("topRated.topRatedThisWeek")}</h3>
      </div>
      <div className={`sidebar-card-body ${theme.body}`}>
        <div className="sidebar-card-summary">
          <div className="sidebar-card-media">
            <div className="sidebar-card-logo" />
            <div
              className={`sidebar-card-badge ${badgeToneClass[card.product.badge.tone]} ${
                index === 0 ? "px-1 py-0.5" : "px-2 py-1"
              }`}
            >
              {card.product.badge.text}
            </div>
          </div>
          <div className={`sidebar-card-copy ${theme.text} ${index === 1 ? "flex-1" : ""}`}>
            <p className="sidebar-card-name">{card.product.name}</p>
            <span className={`sidebar-card-score ${theme.score}`}>
              {card.product.score}
            </span>
            <p className="sidebar-card-meta">
              ({card.product.reviews}) <DotIcon className="inline-block h-4 w-4 font-bold" /> ({card.product.companies}) {t("companyProfile.companies")}
            </p>
          </div>
        </div>
        <div className={`sidebar-card-divider ${theme.divider}`} />
        <p className={`sidebar-card-description ${theme.text}`}>{card.product.description}</p>
        <button className="sidebar-card-cta">
          {t("topRated.visitWebsite")}
        </button>
      </div>
    </div>
  );
}
