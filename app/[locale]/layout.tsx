import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Providers from "@/app/providers";
import DeferredExtras from "@/app/[locale]/DeferredExtras";
import LocaleDocumentSync from "@/app/[locale]/LocaleDocumentSync";
import { getQueryClient } from "@/lib/queryClient";
import { queryKeys } from "@/lib/queryKeys";
import { getServerAuth, getServerTrendingOverview } from "@/lib/server-api";
import RouteTransitionProvider from "@/shared/components/animations/RouteTransitionProvider";
import RouteProgress from "@/shared/components/animations/RouteProgress";
import RouteWarmup from "@/shared/components/animations/RouteWarmup";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return {};
  }
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("defaultTitle"),
    description: t("defaultDescription"),
    openGraph: {
      title: t("defaultTitle"),
      description: t("defaultDescription"),
      siteName: t("siteName"),
      locale: locale === "en" ? "en_US" : locale === "de" ? "de_DE" : "nl_NL",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Load messages directly to avoid relying on next-intl config alias resolution.
  const messages = (await import(`../../messages/${locale}.json`)).default;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const [initialAuth, trendingOverview] = await Promise.all([
    getServerAuth(cookieHeader),
    getServerTrendingOverview(),
  ]);
  const queryClient = getQueryClient();

  queryClient.setQueryData(
    queryKeys.trendingOverview("week"),
    trendingOverview,
  );

  return (
    <Providers initialAuth={initialAuth}>
      <NextIntlClientProvider messages={messages}>
        <LocaleDocumentSync locale={locale} />
        <RouteProgress />
        <RouteWarmup />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <RouteTransitionProvider>{children}</RouteTransitionProvider>
        </HydrationBoundary>
        <DeferredExtras />
      </NextIntlClientProvider>
    </Providers>
  );
}
