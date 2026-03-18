import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { createElement } from "react";
import type { ComponentProps } from "react";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'de', 'nl'],

  // Used when no locale matches
  defaultLocale: 'en'
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
const navigation =
  createNavigation(routing);

type IntlLinkProps = ComponentProps<typeof navigation.Link>;

// Default-preload links more aggressively (viewport + hover) to keep navigation snappy.
export function Link(props: IntlLinkProps) {
  const { prefetch, ...rest } = props;
  // Keep this module Server Component safe: no hooks here.
  return createElement(navigation.Link, {
    ...rest,
    prefetch: prefetch ?? true,
  });
}

export const { redirect, usePathname, useRouter } = navigation;


