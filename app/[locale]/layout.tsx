import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { routing } from '@/i18n/routing';
import Providers from '@/app/providers';
import CookieConsent from '@/app/components/CookieConsent';
import AnalyticsTracker from '@/app/components/AnalyticsTracker';
import { getServerAuth } from '@/lib/server-api';
import { Geist, Geist_Mono, Inter, Space_Grotesk } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

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
  const initialAuth = await getServerAuth(cookieHeader);

  return (
    <html lang={locale}>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${spaceGrotesk.variable} antialiased`}
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
