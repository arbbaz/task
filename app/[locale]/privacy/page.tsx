import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export async function generateMetadata() {
  const t = await getTranslations("privacy");
  return { title: t("title") };
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");

  return (
    <div className="page-container content-section mx-auto max-w-3xl py-8">
      <h1 className="text-2xl font-bold text-text-heading">{t("title")}</h1>
      <p className="mt-2 text-sm text-text-secondary">{t("lastUpdated")}</p>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-text-heading">{t("analyticsHeading")}</h2>
        <p className="mt-2 text-body-sm text-text-primary">{t("analyticsBody")}</p>
        <ul className="mt-2 list-inside list-disc text-body-sm text-text-primary">
          <li>{t("analyticsIp")}</li>
          <li>{t("analyticsLocation")}</li>
          <li>{t("analyticsDevice")}</li>
          <li>{t("analyticsBrowser")}</li>
          <li>{t("analyticsVisitTime")}</li>
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-text-heading">{t("cookiesHeading")}</h2>
        <p className="mt-2 text-body-sm text-text-primary">{t("cookiesBody")}</p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-text-heading">{t("storageHeading")}</h2>
        <p className="mt-2 text-body-sm text-text-primary">{t("storageBody")}</p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-text-heading">{t("choicesHeading")}</h2>
        <p className="mt-2 text-body-sm text-text-primary">{t("choicesBody")}</p>
      </section>

      <p className="mt-8">
        <Link href="/" className="text-primary underline hover:opacity-90">
          {t("backHome")}
        </Link>
      </p>
    </div>
  );
}
