"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/lib/contexts/AuthContext";
import { trackAnalyticsEvent } from "@/shared/components/analytics/AnalyticsTracker";
import HeaderSearch from "@/features/header/components/HeaderSearch";
import NotificationsMenu from "@/features/header/components/NotificationsMenu";
import Skeleton from "@/shared/components/ui/Skeleton";

export default function Header() {
  const t = useTranslations();
  const { isLoggedIn, user, isAuthLoading } = useAuth();
  const displayName = user?.username || t("common.greeting.companyname");

  return (
    <header className="min-h-[52px] sm:min-h-[60px] w-full overflow-visible border-b border-border" role="banner">
      <div className="header-inner overflow-visible">
        <Link href="/" className="header-brand hover:opacity-90 transition-opacity">
          {t("header.title")}
        </Link>
        <HeaderSearch />
        <div className="flex min-w-[140px] shrink-0 items-center justify-end gap-3">
          {isAuthLoading ? (
            <div className="hidden items-center gap-3 lg:flex" aria-hidden>
              <Skeleton className="h-10 w-[120px] rounded-full" />
              <Skeleton className="h-10 w-[92px] rounded-full" />
            </div>
          ) : isLoggedIn ? (
            <NotificationsMenu displayName={displayName} enabled={isLoggedIn} />
          ) : (
            <div className="hidden items-center gap-3 font-inter text-xs text-text-tertiary lg:flex">
              <button
                type="button"
                className="btn-primary px-5 py-3"
                onClick={() => trackAnalyticsEvent("signup_started")}
                aria-label="Sign up for free"
              >
                {t("common.auth.signup")}
              </button>
              <button type="button" className="btn-login-outline" aria-label="Log in to your account">
                {t("common.auth.login")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
