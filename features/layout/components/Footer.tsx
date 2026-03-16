"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-border-separator pb-0 pt-8 sm:pt-16 text-center w-full">
      <Link href="/" className="footer-inner block hover:opacity-90 transition-opacity">
        {t("footer.title")}
      </Link>
      <p className="footer-legal">
        {t("footer.copyright")}
        {" · "}
        <Link href="/privacy" className="text-primary hover:opacity-90 underline">
          {t("footer.privacy")}
        </Link>
      </p>
    </footer>
  );
}

