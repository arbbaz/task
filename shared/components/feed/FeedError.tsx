"use client";

import { useTranslations } from "next-intl";
import StatePanel from "@/shared/components/ui/StatePanel";

interface FeedErrorProps {
  message?: string;
  onRetry?: () => void;
}

export default function FeedError({ message, onRetry }: FeedErrorProps) {
  const t = useTranslations("errors");

  return (
    <StatePanel
      title={t("somethingWentWrong")}
      message={message ?? t("couldNotLoadPage")}
      actionLabel={onRetry ? t("tryAgain") : undefined}
      onAction={onRetry}
    />
  );
}
