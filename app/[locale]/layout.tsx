import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Providers from '@/app/providers';
import AnalyticsTracker from '@/shared/components/analytics/AnalyticsTracker';
import CookieConsent from '@/shared/components/feedback/CookieConsent';
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
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

  return (
    <Providers>
      <NextIntlClientProvider messages={messages}>
        {children}
        <CookieConsent />
        <AnalyticsTracker />
      </NextIntlClientProvider>
    </Providers>
  );
}
