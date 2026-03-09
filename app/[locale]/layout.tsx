import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { routing } from '@/i18n/routing';
import Providers from '@/app/providers';
import CookieConsent from '@/app/components/CookieConsent';
import AnalyticsTracker from '@/app/components/AnalyticsTracker';
import { getServerAuth } from '@/lib/server-api';
import { hasLikelyAuthCookie } from '@/lib/authCookies';
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

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const initialAuth = hasLikelyAuthCookie(cookieHeader)
    ? await getServerAuth(cookieHeader)
    : { isLoggedIn: false, user: null };

  return (
    <html lang={locale}>
      <head />
      <body
        className="antialiased"
      >
        <Providers initialAuth={initialAuth}>
          <NextIntlClientProvider messages={messages}>
            {children}
            <CookieConsent />
            <AnalyticsTracker />
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
