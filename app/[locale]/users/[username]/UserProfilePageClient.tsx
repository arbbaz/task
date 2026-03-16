"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usersApi } from "@/features/users/api/client";
import { useUserProfileData } from "@/features/users/hooks/useUserProfileData";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useToast } from "@/lib/contexts/ToastContext";
import { formatJoined, getActivitySummary } from "@/features/users/utils/profileActivity";
import UserProfileSkeleton from "@/shared/components/ui/UserProfileSkeleton";
import type { Author } from "@/lib/types";
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

  const [activeTab, setActiveTab] = useState<TabId>("reviews");
  const [followers, setFollowers] = useState<Author[]>([]);
  const [following, setFollowing] = useState<Author[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [followStatusByUsername, setFollowStatusByUsername] = useState<Record<string, boolean>>({});
  const [followHoverUnfollow, setFollowHoverUnfollow] = useState(false);

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

  if (loading) {
    return <UserProfileSkeleton />;
  }

  const profileUser = user as (typeof user) & { createdAt?: string };
  const joinedStr = formatJoined(profileUser?.createdAt);

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 sm:pt-12 lg:pt-16">
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

      <div className="mt-6">
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
              loadingMore={loadingMoreReviews}
              onLoadMore={loadMoreReviews}
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
    </div>
  );
}
