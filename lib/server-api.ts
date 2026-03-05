import { getBackendUrl } from "./env";
import type { Review, UserProfile } from "./types";
import { hasLikelyAuthCookie } from "./authCookies";

export interface ServerAuthResult {
  isLoggedIn: boolean;
  user: UserProfile | null;
}

/**
 * Server-only: fetch auth state from backend using request cookies.
 * Pass the result of (await cookies()).toString() or the Cookie header.
 */
export async function getServerAuth(cookieHeader?: string): Promise<ServerAuthResult> {
  const base = getBackendUrl();
  if (!base) return { isLoggedIn: false, user: null };
  try {
    const headers: HeadersInit = {};
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }
    const res = await fetch(`${base}/api/auth/me`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) {
      return { isLoggedIn: false, user: null };
    }
    const data = (await res.json()) as { user?: UserProfile };
    return {
      isLoggedIn: !!data?.user,
      user: data?.user ?? null,
    };
  } catch {
    return { isLoggedIn: false, user: null };
  }
}

export interface ServerReviewsResult {
  reviews: Review[];
}

/**
 * Server-only: fetch approved reviews for the home feed.
 * Optionally pass cookie header to include user vote state.
 */
export async function getServerReviews(options?: {
  limit?: number;
  cookieHeader?: string;
}): Promise<ServerReviewsResult> {
  const base = getBackendUrl();
  if (!base) return { reviews: [] };
  const limit = options?.limit ?? 20;
  const hasAuthContext = hasLikelyAuthCookie(options?.cookieHeader);
  try {
    const url = `${base}/api/reviews?status=APPROVED&limit=${limit}`;
    const headers: HeadersInit = {};
    if (options?.cookieHeader) {
      headers["Cookie"] = options.cookieHeader;
    }
    const res = await fetch(url, {
      headers,
      ...(hasAuthContext
        ? { cache: "no-store" as const }
        : { next: { revalidate: 30 } }),
    });
    if (!res.ok) {
      return { reviews: [] };
    }
    const data = (await res.json()) as { reviews?: Review[] };
    return {
      reviews: Array.isArray(data?.reviews) ? data.reviews : [],
    };
  } catch {
    return { reviews: [] };
  }
}
