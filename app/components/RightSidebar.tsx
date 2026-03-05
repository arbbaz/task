"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';
import { signIn, useSession } from "next-auth/react";
import { helpMenuItems, topRatedCards } from "../data/constants";
import Separator from "./Separator";
import TopRatedCard from "./TopRatedCard";
import Toast from "./Toast";
import { authApi, trendingApi } from "../../lib/api";
import { loginSchema, registerSchema } from "../../lib/validations";
import { trackAnalyticsEvent } from "./AnalyticsTracker";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../contexts/AuthContext";
import { truncateWithEllipsis } from "../utils/textUtils";

type TopRatedCardData = {
  title: string;
  product: {
    name: string;
    score: string;
    reviews: string;
    companies: string;
    badge: { text: string; color: string };
    description: string;
    bgColor: string;
    textColor: string;
    scoreColor: string;
    separatorColor: string;
    hasVerify?: boolean;
  };
};

export default function RightSidebar() {
  const t = useTranslations();
  const { status } = useSession();
  const { isLoggedIn, refreshAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [dynamicTopRatedCards, setDynamicTopRatedCards] = useState<TopRatedCardData[]>(() =>
    topRatedCards.slice(0, 2).map((card) => ({
      title: card.title,
      product: {
        ...card.product,
        hasVerify: card.product.hasVerify,
      },
    }))
  );
  const isAuthenticated = isLoggedIn || status === "authenticated";

  const helpMenuTranslations = [
    `${t('sidebar.readMessages')} (29)`,
    t('sidebar.editProfile'),
    t('sidebar.changePassword'),
    t('sidebar.fileComplaint'),
    `${t('sidebar.writeSupportTicket')} (4)`,
  ];

  const completeAuthentication = (message: string) => {
    setToast({ message, type: "success" });
    void refreshAuth();
  };

  const signInWithCredentials = async () => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setToast({ message: result.error, type: "error" });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isSignup) {
        const usernameBase = (email.split("@")[0] || "user").trim();
        const normalizedUsername = usernameBase
          .replace(/[^a-zA-Z0-9_]/g, "_")
          .replace(/^_+|_+$/g, "");
        const username = normalizedUsername || `user_${Date.now()}`;

        const parsed = registerSchema.safeParse({ email, username, password });
        if (!parsed.success) {
          const first = parsed.error.issues[0];
          const msg = first?.message ?? "Validation failed";
          setError(msg);
          setToast({ message: msg, type: "error" });
          setSubmitting(false);
          return;
        }

        const response = await authApi.register({
          email: parsed.data.email,
          username: parsed.data.username,
          password: parsed.data.password,
        });

        if (response.error) {
          setError(response.error);
          setToast({ message: response.error, type: "error" });
          return;
        }

        if (await signInWithCredentials()) {
          trackAnalyticsEvent("signup_completed");
          completeAuthentication("Account created successfully!");
        }

        return;
      }

      const parsed = loginSchema.safeParse({ email, password });
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        const msg = first?.message ?? "Validation failed";
        setError(msg);
        setToast({ message: msg, type: "error" });
        setSubmitting(false);
        return;
      }

      const response = await authApi.login({ email: parsed.data.email, password: parsed.data.password });
      if (response.error) {
        setError(response.error);
        setToast({ message: response.error, type: "error" });
        return;
      }

      if (await signInWithCredentials()) {
        completeAuthentication("Logged in successfully!");
      }
    } catch {
      const errorMessage = "An error occurred. Please try again.";
      setError(errorMessage);
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAuthModeToggle = () => {
    setIsSignup((prev) => !prev);
    setError("");
  };

  useEffect(() => {
    let isMounted = true;
    let timerId: number | ReturnType<typeof setTimeout> | null = null;
    const idleWindow = window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number }
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    const loadTopRated = async () => {
      const response = await trendingApi.get({ period: 'week', limit: 2 });
      if (!isMounted) {
        return;
      }
      if (response.error || !response.data?.topRatedThisWeek?.length) {
        return;
      }

      const cards = response.data.topRatedThisWeek.slice(0, 2).map((item, index) => ({
        title: "Top rated this week",
        product: {
          name: truncateWithEllipsis(item.name, 26),
          score: `${item.averageScore.toFixed(1)}/10`,
          reviews: `${item.reviewCount} Reviews`,
          companies: "1",
          badge: index === 0
            ? { text: "Rising", color: "bg-accent-blue" }
            : { text: "New", color: "bg-alert-orange-light" },
          description: truncateWithEllipsis(item.description || item.name, 92),
          bgColor: index === 0 ? "bg-dark-card" : "bg-card-purple-light-bg",
          textColor: index === 0 ? "text-white" : "text-text-dark",
          scoreColor: index === 0 ? "text-emerald" : "text-primary-light",
          separatorColor: index === 0 ? "bg-border-gray" : "bg-card-purple-light-border",
          hasVerify: index === 1,
        },
      }));

      setDynamicTopRatedCards(cards);
    };

    if (typeof idleWindow.requestIdleCallback === "function") {
      const id = idleWindow.requestIdleCallback(() => {
        void loadTopRated();
      }, { timeout: 1400 });
      timerId = id;
    } else {
      timerId = globalThis.setTimeout(() => {
        void loadTopRated();
      }, 450);
    }

    return () => {
      isMounted = false;
      if (timerId != null) {
        if (
          typeof timerId === "number" &&
          typeof idleWindow.cancelIdleCallback === "function"
        ) {
          idleWindow.cancelIdleCallback(timerId);
        } else {
          globalThis.clearTimeout(timerId);
        }
      }
    };
  }, []);

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={!!toast}
          onClose={() => setToast(null)}
        />
      )}
      <aside className="space-y-3 px-4 sm:px-0 lg:pl-5 sidebar-border-left">
      {isAuthenticated ? (
        <div className="rounded-md bg-bg-light p-3 text-center sm:text-end px-4 sm:px-14 mt-4">
        <div className="flex items-end justify-end gap-2">
          <h3 className="text-[13px] font-bold text-text-primary text-end font-inter">{t('sidebar.needHelp')}</h3>
          <Image src="/verify.svg" alt="arrow-right" width={16} height={16} />
        </div>
        <Separator />
        <div className="mt-2 space-y-2 text-[13px] text-text-quaternary text-center sm:text-end">
          {helpMenuItems.map((item, index, array) => (
            <div key={`${item}-${index}`}>
              <div className="pb-1 text-center sm:text-end text-text-primary font-normal font-inter">
                {helpMenuTranslations[index] || item}
              </div>
              {index < array.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </div>
      ) : (
        <div>
          <div className="card-base border border-[#E5E5E5] p-5 mt-4 z-10">
            <h3 className="text-heading-center">{isSignup ? t('common.auth.createAccount') : t('common.auth.signIn')}</h3>
            <p className="text-description mt-2">{isSignup ? t('common.auth.itsFree') : t('common.auth.welcomeBack')}</p>
            <button type="button" disabled className="btn-disabled-secondary">
              <FcGoogle size={21} />
              {t("common.auth.continueWithGoogle")}
            </button>
            <div className="mt-8 mb-8">
              <Separator className="bg-[#E5E5E5]" />
            </div>


            <form onSubmit={handleSubmit} className="">
              <div className="mb-3">
                <label htmlFor="sidebar-auth-email" className="text-label mb-2 ml-2">{t('common.auth.emailAddress')}</label>
                <input
                  id="sidebar-auth-email"
                  type="email"
                  placeholder={t('common.auth.enterEmail')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full input-field border-[#E5E5E5]"
                  required
                />
              </div>
              <div className="mb-3 mt-4">
                <label htmlFor="sidebar-auth-password" className="text-label mb-2 ml-2">{t('common.auth.password')}</label>
                <input
                  id="sidebar-auth-password"
                  type="password"
                  placeholder={t('common.auth.password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full input-field border-[#E5E5E5]"
                  required
                />
              </div>
              {error && (
                <p className="text-xs text-alert-red mb-3 text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="mt-3 h-10 w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('common.auth.processing') : isSignup ? t('common.auth.signUp') : t('common.auth.signIn')}
              </button>
            </form>
          </div>
          <div className="sidebar-right-panel">
            {isSignup ? t("common.auth.alreadyHaveAccount") : t("common.auth.dontHaveAccount")}{" "}
            <button
              type="button"
              onClick={handleAuthModeToggle}
              className="text-[#111111] font-semibold text-[13px]"
            >
              {isSignup ? t('common.auth.signIn') : t('common.auth.signUp')}
            </button>
          </div>
        </div>
      )}



      {dynamicTopRatedCards.map((card, index) => (
        <TopRatedCard key={`${card.title}-${card.product.name}-${index}`} card={card} index={index} />
      ))}
    </aside>
    </>
  );
}
