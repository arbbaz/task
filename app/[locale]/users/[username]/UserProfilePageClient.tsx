"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ReviewCard from "@/features/reviews/components/ReviewCard";
import ComplaintListCard from "@/features/complaints/components/ComplaintListCard";
import { usersApi } from "@/features/users/api/client";
import { useUserProfileData } from "@/features/users/hooks/useUserProfileData";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useToast } from "@/lib/contexts/ToastContext";
import type { Author } from "@/lib/types";

const PAGE_SIZE = 10;

interface UserProfilePageClientProps {
  username: string;
}

function VerifiedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/20"
      title="Verified user"
    >
      <svg
        className="h-3.5 w-3.5 shrink-0"
        aria-hidden
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
      Verified
    </span>
  );
}

export default function UserProfilePageClient({ username }: UserProfilePageClientProps) {
  const { isLoggedIn, user: currentUser } = useAuth();
  const {
    user,
    stats,
    isFollowing,
    reviews,
    complaints,
    reviewsPagination,
    complaintsPagination,
    loading,
    loadingMoreReviews,
    loadingMoreComplaints,
    toggleFollow,
    loadMoreReviews,
    loadMoreComplaints,
  } = useUserProfileData(username);
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"reviews" | "complaints" | "followers" | "following">(
    "reviews",
  );
  const [followers, setFollowers] = useState<Author[]>([]);
  const [following, setFollowing] = useState<Author[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [followStatusByUsername, setFollowStatusByUsername] = useState<Record<string, boolean>>({});
  const [followHoverUnfollow, setFollowHoverUnfollow] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!username || (activeTab !== "followers" && activeTab !== "following")) return;
    let cancelled = false;
    setLoadingRelations(true);
    if (activeTab === "followers") {
      usersApi.followers(username).then((res) => {
        if (!cancelled && !res.error && res.data) setFollowers(res.data.users);
        setLoadingRelations(false);
      });
    } else {
      usersApi.following(username).then((res) => {
        if (!cancelled && !res.error && res.data) setFollowing(res.data.users);
        setLoadingRelations(false);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [activeTab, username]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const list = activeTab === "followers" ? followers : activeTab === "following" ? following : [];
    const usernames = list.map((u) => u.username).filter(Boolean);
    if (usernames.length === 0) return;
    usersApi.getFollowStatusBulk(usernames).then((res) => {
      if (!res.error && res.data) setFollowStatusByUsername(res.data.following);
    });
  }, [activeTab, isLoggedIn, followers, following]);

  const formatJoined = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } catch {
      return null;
    }
  };

  const handleFollowRow = async (targetUsername: string, currentlyFollowing: boolean) => {
    if (currentlyFollowing) {
      const res = await usersApi.unfollow(targetUsername);
      if (!res.error) setFollowStatusByUsername((prev) => ({ ...prev, [targetUsername]: false }));
    } else {
      const res = await usersApi.follow(targetUsername);
      if (!res.error) setFollowStatusByUsername((prev) => ({ ...prev, [targetUsername]: true }));
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = `${username} – Profile`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, url });
        showToast("Profile link shared.", "success");
      } else {
        await navigator.clipboard.writeText(url);
        showToast("Profile link copied to clipboard.", "success");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        showToast("Failed to share profile.", "error");
      }
    }
  };

  const switchTab = (tab: "reviews" | "complaints" | "followers" | "following") => {
    setActiveTab(tab);
    setTimeout(() => {
      const panel = document.getElementById(`panel-${tab}`);
      const firstFocusable = panel?.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (firstFocusable) {
        firstFocusable.focus({ preventScroll: true });
      } else {
        panel?.focus();
      }
    }, 0);
  };

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const reviewsThisMonth =
    reviews.filter((r) => {
      try {
        const d = new Date(r.createdAt);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      } catch {
        return false;
      }
    }).length;
  const complaintsThisMonth =
    complaints.filter((c) => {
      try {
        const d = new Date(c.createdAt);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      } catch {
        return false;
      }
    }).length;
  const lastActivity =
    reviews.length > 0 || complaints.length > 0
      ? [...reviews, ...complaints].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0]
      : null;
  const lastActivityLabel = lastActivity
    ? (() => {
        const d = new Date(lastActivity.createdAt);
        const diffMs = now.getTime() - d.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      })()
    : null;

  if (!loading && !user) {
    router.push("/");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full animate-pulse">
        <div className="mx-auto max-w-4xl px-4 pt-8 sm:pt-12 lg:pt-16">
          <div className="card-base">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 flex-shrink-0 rounded-full bg-[#E5E5E5]" />
                <div className="space-y-2">
                  <div className="h-5 w-32 rounded bg-[#E5E5E5]" />
                  <div className="h-4 w-48 rounded bg-[#E5E5E5]" />
                </div>
              </div>
              <div className="h-9 w-24 rounded-full bg-[#E5E5E5]" />
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="h-4 w-20 rounded bg-[#E5E5E5]" />
              <div className="h-4 w-16 rounded bg-[#E5E5E5]" />
              <div className="h-4 w-14 rounded bg-[#E5E5E5]" />
              <div className="h-4 w-20 rounded bg-[#E5E5E5]" />
            </div>
          </div>
          <div className="mt-6">
            <div className="mb-4 flex gap-1 rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] p-1">
              <div className="h-9 flex-1 rounded-lg bg-[#E5E5E5]" />
              <div className="h-9 flex-1 rounded-lg bg-[#E5E5E5]" />
              <div className="h-9 flex-1 rounded-lg bg-[#E5E5E5]" />
              <div className="h-9 flex-1 rounded-lg bg-[#E5E5E5]" />
            </div>
            <div className="space-y-4">
              <div className="card-base h-24 rounded-lg bg-[#F5F5F5]" />
              <div className="card-base h-32 rounded-lg bg-[#F5F5F5]" />
              <div className="card-base h-28 rounded-lg bg-[#F5F5F5]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const profileUser = user as (typeof user) & { createdAt?: string };
  const joinedStr = formatJoined(profileUser?.createdAt);

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 sm:pt-12 lg:pt-16">
      <div className="card-base">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-semibold uppercase text-primary ring-2 ring-primary/20">
              {user?.username?.slice(0, 2) ?? "US"}
            </div>
            <div className="min-w-0">
              <h1 className="flex flex-wrap items-center gap-2 text-xl font-semibold text-text-primary">
                @{user?.username}
                {user?.verified && <VerifiedBadge />}
              </h1>
              {user?.bio && <p className="mt-1 text-sm text-text-secondary">{user.bio}</p>}
              {joinedStr && (
                <p className="mt-1 text-xs text-text-secondary">Joined {joinedStr}</p>
              )}
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex h-9 items-center gap-1.5 rounded-full border border-[#E5E5E5] bg-white px-3 text-xs font-semibold text-text-secondary transition hover:border-primary hover:text-primary"
              aria-label="Share profile"
            >
              <svg className="h-4 w-4" aria-hidden fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share
            </button>
            {isLoggedIn && user && (
              <button
                type="button"
                onClick={() => void toggleFollow()}
                onMouseEnter={() => setFollowHoverUnfollow(true)}
                onMouseLeave={() => setFollowHoverUnfollow(false)}
                aria-label={
                  isFollowing
                    ? followHoverUnfollow
                      ? `Unfollow @${user.username}`
                      : `Following @${user.username}`
                    : `Follow @${user.username}`
                }
                className={`h-9 rounded-full px-4 text-xs font-semibold transition ${
                  isFollowing
                    ? "border border-primary bg-white text-primary hover:border-alert-red hover:bg-alert-red/5 hover:text-alert-red"
                    : "btn-primary"
                }`}
              >
                {isFollowing ? (followHoverUnfollow ? "Unfollow" : "Following") : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Activity summary */}
        {(reviewsThisMonth > 0 || complaintsThisMonth > 0 || lastActivityLabel) && (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#E5E5E5] pt-4 text-xs text-text-secondary">
            {reviewsThisMonth > 0 && (
              <span>
                <span className="font-semibold text-text-primary">{reviewsThisMonth}</span> review
                {reviewsThisMonth !== 1 ? "s" : ""} this month
              </span>
            )}
            {complaintsThisMonth > 0 && (
              <span>
                <span className="font-semibold text-text-primary">{complaintsThisMonth}</span>{" "}
                complaint{complaintsThisMonth !== 1 ? "s" : ""} this month
              </span>
            )}
            {lastActivityLabel && (
              <span>
                Last active: <span className="font-medium text-text-primary">{lastActivityLabel}</span>
              </span>
            )}
          </div>
        )}

        {stats && (
          <>
            <div className="mt-4 border-t border-[#E5E5E5] pt-4">
              <div className="flex flex-wrap items-center gap-6 text-xs text-text-secondary">
                <button
                  type="button"
                  onClick={() => setActiveTab("followers")}
                  className="hover:text-primary transition-colors"
                >
                  <span className="font-semibold text-text-primary">{stats.followersCount}</span>{" "}
                  Followers
                </button>
                <span className="text-[#E5E5E5]">|</span>
                <button
                  type="button"
                  onClick={() => setActiveTab("following")}
                  className="hover:text-primary transition-colors"
                >
                  <span className="font-semibold text-text-primary">{stats.followingCount}</span>{" "}
                  Following
                </button>
                <span className="text-[#E5E5E5]">|</span>
                <span>
                  <span className="font-semibold text-text-primary">{stats.postsCount}</span> Posts
                </span>
                <span className="text-[#E5E5E5]">|</span>
                <span>
                  <span className="font-semibold text-text-primary">{stats.complaintsCount}</span>{" "}
                  Complaints
                </span>
                {typeof (user as { reputation?: number })?.reputation === "number" && (
                  <>
                    <span className="text-[#E5E5E5]">|</span>
                    <span>
                      <span className="font-semibold text-text-primary">
                        {(user as { reputation: number }).reputation}
                      </span>{" "}
                      Reputation
                    </span>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-6">
        {/* Tabs */}
        <div
          className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] p-1"
          role="tablist"
          aria-label="Profile sections"
        >
          {[
            {
              id: "reviews",
              label: "Reviews",
              count: reviewsPagination?.total ?? reviews.length,
            },
            {
              id: "complaints",
              label: "Complaints",
              count: complaintsPagination?.total ?? complaints.length,
            },
            { id: "followers", label: "Followers", count: stats?.followersCount ?? 0 },
            { id: "following", label: "Following", count: stats?.followingCount ?? 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => switchTab(tab.id as typeof activeTab)}
              className={`min-w-[80px] flex-shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-white text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div
          ref={activeTab === "reviews" ? panelRef : undefined}
          className="space-y-4"
          role="tabpanel"
          id="panel-reviews"
          aria-labelledby="tab-reviews"
          aria-hidden={activeTab !== "reviews"}
          hidden={activeTab !== "reviews"}
          tabIndex={activeTab === "reviews" ? -1 : undefined}
        >
          {activeTab === "reviews" &&
            (reviews.length > 0 ? (
              <>
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
                {reviewsPagination &&
                  reviews.length < reviewsPagination.total &&
                  (reviewsPagination.page < reviewsPagination.totalPages ? (
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => void loadMoreReviews()}
                        disabled={loadingMoreReviews}
                        className="rounded-full border border-[#E5E5E5] bg-white px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary disabled:opacity-50"
                      >
                        {loadingMoreReviews ? "Loading…" : "Load more reviews"}
                      </button>
                    </div>
                  ) : null)}
              </>
            ) : (
              <div className="card-base py-8 text-center text-sm text-text-secondary">
                <p className="font-medium text-text-primary">No reviews yet</p>
                <p className="mt-1">Reviews from @{username} will show here.</p>
              </div>
            ))}
        </div>

        <div
          className="space-y-4"
          role="tabpanel"
          id="panel-complaints"
          aria-labelledby="tab-complaints"
          aria-hidden={activeTab !== "complaints"}
          hidden={activeTab !== "complaints"}
          tabIndex={activeTab === "complaints" ? -1 : undefined}
        >
          {activeTab === "complaints" &&
            (complaints.length > 0 ? (
              <>
                {complaints.map((complaint, index) => (
                  <ComplaintListCard key={complaint.id} complaint={complaint} index={index} />
                ))}
                {complaintsPagination &&
                  complaints.length < complaintsPagination.total &&
                  (complaintsPagination.page < complaintsPagination.totalPages ? (
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => void loadMoreComplaints()}
                        disabled={loadingMoreComplaints}
                        className="rounded-full border border-[#E5E5E5] bg-white px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary disabled:opacity-50"
                      >
                        {loadingMoreComplaints ? "Loading…" : "Load more complaints"}
                      </button>
                    </div>
                  ) : null)}
              </>
            ) : (
              <div className="card-base py-8 text-center text-sm text-text-secondary">
                <p className="font-medium text-text-primary">No complaints yet</p>
                <p className="mt-1">Complaints from @{username} will show here.</p>
              </div>
            ))}
        </div>

        <div
          className="space-y-4"
          role="tabpanel"
          id="panel-followers"
          aria-labelledby="tab-followers"
          aria-hidden={activeTab !== "followers"}
          hidden={activeTab !== "followers"}
          tabIndex={activeTab === "followers" ? -1 : undefined}
        >
          {activeTab === "followers" &&
            (loadingRelations ? (
              <div className="card-base py-6 text-center text-sm text-text-secondary">
                Loading followers…
              </div>
            ) : followers.length > 0 ? (
              <div className="card-base divide-y divide-[#E5E5E5]">
                {followers.map((follower) => {
                  const isFollowingRow = followStatusByUsername[follower.username] ?? false;
                  return (
                    <div
                      key={follower.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <Link
                        href={`/${locale}/users/${encodeURIComponent(follower.username)}`}
                        className="flex min-w-0 flex-1 items-center gap-3 transition hover:opacity-90"
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary">
                          {follower.username?.slice(0, 2) ?? "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-text-primary">
                            @{follower.username}
                          </p>
                          {follower.bio && (
                            <p className="truncate text-xs text-text-secondary">{follower.bio}</p>
                          )}
                        </div>
                      </Link>
                      {isLoggedIn && follower.username !== currentUser?.username && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            void handleFollowRow(follower.username, isFollowingRow);
                          }}
                          className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
                            isFollowingRow
                              ? "border border-[#E5E5E5] bg-white text-text-secondary hover:border-primary hover:text-primary"
                              : "btn-primary"
                          }`}
                        >
                          {isFollowingRow ? "Following" : "Follow"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card-base py-8 text-center text-sm text-text-secondary">
                <p className="font-medium text-text-primary">No followers yet</p>
                <p className="mt-1">When someone follows @{username}, they&apos;ll appear here.</p>
              </div>
            ))}
        </div>

        <div
          className="space-y-4"
          role="tabpanel"
          id="panel-following"
          aria-labelledby="tab-following"
          aria-hidden={activeTab !== "following"}
          hidden={activeTab !== "following"}
          tabIndex={activeTab === "following" ? -1 : undefined}
        >
          {activeTab === "following" &&
            (loadingRelations ? (
              <div className="card-base py-6 text-center text-sm text-text-secondary">
                Loading following…
              </div>
            ) : following.length > 0 ? (
              <div className="card-base divide-y divide-[#E5E5E5]">
                {following.map((u) => {
                  const isFollowingRow = followStatusByUsername[u.username] ?? false;
                  return (
                    <div
                      key={u.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <Link
                        href={`/${locale}/users/${encodeURIComponent(u.username)}`}
                        className="flex min-w-0 flex-1 items-center gap-3 transition hover:opacity-90"
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary">
                          {u.username?.slice(0, 2) ?? "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-text-primary">@{u.username}</p>
                          {u.bio && (
                            <p className="truncate text-xs text-text-secondary">{u.bio}</p>
                          )}
                        </div>
                      </Link>
                      {isLoggedIn && u.username !== currentUser?.username && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            void handleFollowRow(u.username, isFollowingRow);
                          }}
                          className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
                            isFollowingRow
                              ? "border border-[#E5E5E5] bg-white text-text-secondary hover:border-primary hover:text-primary"
                              : "btn-primary"
                          }`}
                        >
                          {isFollowingRow ? "Following" : "Follow"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card-base py-8 text-center text-sm text-text-secondary">
                <p className="font-medium text-text-primary">Not following anyone yet</p>
                <p className="mt-1">When @{username} follows people, they&apos;ll appear here.</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

