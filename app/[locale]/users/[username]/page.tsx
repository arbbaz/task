import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import AppShell from "@/features/layout/components/AppShell";
import { getServerUserProfile } from "@/lib/server-api";
import UserProfilePageClient from "./UserProfilePageClient";

interface PageProps {
  params: Promise<{ locale: string; username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, username } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const fallbackTitle = `${username} – ${t("homeTitle")}`;
  const fallbackDescription = t("homeDescription");

  try {
    const { user } = await getServerUserProfile(username);
    const title = user
      ? `@${user.username}${user.bio?.trim() ? ` – ${user.bio.slice(0, 50)}${user.bio.length > 50 ? "…" : ""}` : ""}`
      : fallbackTitle;
    const description =
      (user?.bio && user.bio.trim()) || fallbackDescription;
    const siteUrl =
      typeof process !== "undefined" && process.env.NEXT_PUBLIC_APP_URL
        ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
        : null;
    const avatarUrl =
      user?.avatar && user.avatar.startsWith("http")
        ? user.avatar
        : user?.avatar && siteUrl
          ? `${siteUrl}${user.avatar.startsWith("/") ? "" : "/"}${user.avatar}`
          : null;

    return {
      title: title || fallbackTitle,
      description,
      openGraph: {
        title: title || fallbackTitle,
        description,
        ...(avatarUrl && { images: [{ url: avatarUrl, width: 200, height: 200, alt: `@${user?.username}` }] }),
      },
      twitter: {
        card: "summary",
        title: title || fallbackTitle,
        description,
      },
    };
  } catch {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
    };
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  return (
    <AppShell>
      <UserProfilePageClient username={username} />
    </AppShell>
  );
}

