import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import ServerProviders from '@/app/ServerProviders';
import DeferredExtras from '@/app/[locale]/DeferredExtras';
import RouteTransitionProvider from "@/shared/components/animations/RouteTransitionProvider";
import RouteProgress from "@/shared/components/animations/RouteProgress";
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
  params
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
  const analyticsConsentValue = cookieStore.get("analytics_consent")?.value;
  const initialAnalyticsConsent =
    analyticsConsentValue === "true" ? true : analyticsConsentValue === "false" ? false : null;

  return (
    <ServerProviders>
      <NextIntlClientProvider messages={messages}>
        <RouteProgress />
        <RouteTransitionProvider>{children}</RouteTransitionProvider>
        <DeferredExtras initialAnalyticsConsent={initialAnalyticsConsent} />
      </NextIntlClientProvider>
    </ServerProviders>
  );
}
