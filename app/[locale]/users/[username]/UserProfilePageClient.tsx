"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/client";
import {
  useProfileQueries,
  useFollowersQuery,
  useFollowingQuery,
  useFollowStatusBulkQuery,
} from "@/features/users/hooks/useProfileQueries";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useToast } from "@/lib/contexts/ToastContext";
import { formatJoined, getActivitySummary } from "@/features/users/utils/profileActivity";
import UserProfileSkeleton from "@/shared/components/ui/UserProfileSkeleton";
import { queryKeys } from "@/lib/queryKeys";
import {
  type TabId,
  ProfileHeader,
  ProfileActivitySummary,
  ProfileStatsRow,
  ProfileTabList,
  ProfileReviewsPanel,
  ProfileComplaintsPanel,
  ProfileFollowersPanel,
  ProfileFollowingPanel,
} from "./components";

interface UserProfilePageClientProps {
  username: string;
}

export default function UserProfilePageClient({ username }: UserProfilePageClientProps) {
  const queryClient = useQueryClient();
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
    loadingReviews,
    loadingComplaints,
    loadingMoreReviews,
    loadingMoreComplaints,
    toggleFollow,
    loadMoreReviews,
    loadMoreComplaints,
    updateReviewVote,
    updateComplaintVote,
  } = useProfileQueries(username, {
    // Waterfall: only fetch reviews/complaints after profile is loaded so LCP (profile card) isn't blocked.
    enableListsAfterProfile: true,
  });
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabId>("reviews");
  const [followHoverUnfollow, setFollowHoverUnfollow] = useState(false);

  const followersQuery = useFollowersQuery(username, !!user && activeTab === "followers");
  const followingQuery = useFollowingQuery(username, !!user && activeTab === "following");
  const followers = followersQuery.data ?? [];
  const following = followingQuery.data ?? [];
  const loadingRelations = activeTab === "followers" ? followersQuery.isLoading : followingQuery.isLoading;

  const relationUsernames = activeTab === "followers"
    ? followers.map((u) => u.username).filter(Boolean)
    : following.map((u) => u.username).filter(Boolean);
  const followStatusQuery = useFollowStatusBulkQuery(
    relationUsernames,
    !!user &&
      (activeTab === "followers" || activeTab === "following") &&
      relationUsernames.length > 0,
    currentUser?.id ?? null
  );

  const reviewAuthorUsernames = useMemo(
    () => [...new Set(reviews.map((r) => r.author?.username).filter(Boolean))] as string[],
    [reviews]
  );
  const reviewAuthorsFollowQuery = useFollowStatusBulkQuery(
    reviewAuthorUsernames,
    !!user && activeTab === "reviews" && reviewAuthorUsernames.length > 0,
    currentUser?.id ?? null
  );

  const followStatusByUsername =
    activeTab === "reviews"
      ? (reviewAuthorsFollowQuery.data?.following ?? {})
      : (followStatusQuery.data?.following ?? {});

  const handleFollowRow = async (targetUsername: string, currentlyFollowing: boolean) => {
    if (currentlyFollowing) {
      const res = await usersApi.unfollow(targetUsername);
      if (!res.error) {
        queryClient.invalidateQueries({ queryKey: queryKeys.profile(username) });
        queryClient.invalidateQueries({ queryKey: queryKeys.profileFollowers(username) });
        queryClient.invalidateQueries({ queryKey: queryKeys.profileFollowing(username) });
        queryClient.invalidateQueries({ queryKey: ["follow-status-bulk"] });
      }
    } else {
      const res = await usersApi.follow(targetUsername);
      if (!res.error) {
        queryClient.invalidateQueries({ queryKey: queryKeys.profile(username) });
        queryClient.invalidateQueries({ queryKey: queryKeys.profileFollowers(username) });
        queryClient.invalidateQueries({ queryKey: queryKeys.profileFollowing(username) });
        queryClient.invalidateQueries({ queryKey: ["follow-status-bulk"] });
      }
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

  const switchTab = (tab: TabId) => {
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

  const activity = useMemo(
    () => getActivitySummary(reviews, complaints),
    [reviews, complaints],
  );
  const tabs = useMemo(
    () => [
      { id: "reviews" as const, label: "Reviews", count: reviewsPagination?.total ?? reviews.length },
      {
        id: "complaints" as const,
        label: "Complaints",
        count: complaintsPagination?.total ?? complaints.length,
      },
      { id: "followers" as const, label: "Followers", count: stats?.followersCount ?? 0 },
      { id: "following" as const, label: "Following", count: stats?.followingCount ?? 0 },
    ],
    [
      reviewsPagination?.total,
      reviews.length,
      complaintsPagination?.total,
      complaints.length,
      stats?.followersCount,
      stats?.followingCount,
    ],
  );

  if (!loading && !user) {
    router.push("/");
    return null;
  }

  const profileUser = user as (typeof user) & { createdAt?: string };
  const joinedStr = formatJoined(profileUser?.createdAt);

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 sm:pt-12 lg:pt-16 pb-16">
      {loading ? (
        <UserProfileSkeleton />
      ) : (
    <>
      <div className="card-base">
        <ProfileHeader
          user={user!}
          joinedStr={joinedStr}
          isLoggedIn={isLoggedIn}
          isFollowing={isFollowing}
          followHoverUnfollow={followHoverUnfollow}
          onFollow={toggleFollow}
          onFollowHover={setFollowHoverUnfollow}
          onShare={handleShare}
        />
        <ProfileActivitySummary activity={activity} />
        {stats && <ProfileStatsRow stats={stats} onTabChange={switchTab} />}
      </div>

      <div className="mt-6 min-h-[420px]">
        <ProfileTabList tabs={tabs} activeTab={activeTab} onTabChange={switchTab} />

        <div
          className="space-y-4"
          role="tabpanel"
          id="panel-reviews"
          aria-labelledby="tab-reviews"
          aria-hidden={activeTab !== "reviews"}
          hidden={activeTab !== "reviews"}
          tabIndex={activeTab === "reviews" ? -1 : undefined}
        >
          {activeTab === "reviews" && (
            <ProfileReviewsPanel
              reviews={reviews}
              username={username}
              hasMore={
                Boolean(
                  reviewsPagination &&
                    reviews.length < reviewsPagination.total &&
                    reviewsPagination.page < reviewsPagination.totalPages,
                )
              }
              loading={loadingReviews}
              loadingMore={loadingMoreReviews}
              onLoadMore={loadMoreReviews}
              onVoteUpdate={updateReviewVote}
              followStatusByUsername={followStatusByUsername}
            />
          )}
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
          {activeTab === "complaints" && (
            <ProfileComplaintsPanel
              complaints={complaints}
              username={username}
              hasMore={
                Boolean(
                  complaintsPagination &&
                    complaints.length < complaintsPagination.total &&
                    complaintsPagination.page < complaintsPagination.totalPages,
                )
              }
              loading={loadingComplaints}
              loadingMore={loadingMoreComplaints}
              onLoadMore={loadMoreComplaints}
            />
          )}
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
          {activeTab === "followers" && (
            <ProfileFollowersPanel
              followers={followers}
              username={username}
              loading={loadingRelations}
              followStatusByUsername={followStatusByUsername}
              currentUsername={currentUser?.username}
              onFollow={(targetUsername, currentlyFollowing) =>
                void handleFollowRow(targetUsername, currentlyFollowing)
              }
              locale={locale}
            />
          )}
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
          {activeTab === "following" && (
            <ProfileFollowingPanel
              following={following}
              username={username}
              loading={loadingRelations}
              followStatusByUsername={followStatusByUsername}
              currentUsername={currentUser?.username}
              onFollow={(targetUsername, currentlyFollowing) =>
                void handleFollowRow(targetUsername, currentlyFollowing)
              }
              locale={locale}
            />
          )}
        </div>
      </div>
    </>
      )}
    </div>
  );
}
