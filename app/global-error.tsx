"use client";

import Link from "next/link";

/**
 * Root-level error boundary. Catches errors that escape the locale error boundary
 * (e.g. in root layout or providers). Replaces the entire root layout when triggered.
 * Keep minimal: no providers or i18n here.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error;

  return (
    <html lang="und" suppressHydrationWarning>
      <body className="antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 py-12">
          <h1 className="text-xl font-semibold text-gray-900">
            Something went wrong
          </h1>
          <p className="max-w-md text-center text-sm text-gray-600">
            We couldn’t load the app. Please try again.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
