"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useProfileQueries } from "@/features/users/hooks/useProfileQueries";
import { useAuth } from "@/lib/contexts/AuthContext";
import { formatJoined } from "@/features/users/utils/profileActivity";
import UserProfileSkeleton from "@/shared/components/ui/UserProfileSkeleton";
import {
  ProfileHeader,
  ProfileActivitySummary,
  ProfileStatsRow,
  ProfileTabList,
  ProfileReviewsPanel,
  ProfileComplaintsPanel,
  ProfileFollowersPanel,
  ProfileFollowingPanel,
} from "./components";
import { useProfileShare } from "./hooks/useProfileShare";
import { useProfileTabState } from "./hooks/useProfileTabState";
import { useProfileRelations } from "./hooks/useProfileRelations";
import { useProfilePresentation } from "./hooks/useProfilePresentation";

interface UserProfilePageClientProps {
  username: string;
}

export default function UserProfilePageClient({ username }: UserProfilePageClientProps) {
  const { isLoggedIn, user: currentUser } = useAuth();
  const reduceMotion = useReducedMotion();
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
    refetchReviews,
    refetchComplaints,
    toggleFollow,
    loadMoreReviews,
    loadMoreComplaints,
    updateReviewVote,
    reviewsError,
    complaintsError,
  } = useProfileQueries(username, {
    // Waterfall: only fetch reviews/complaints after profile is loaded so LCP (profile card) isn't blocked.
    enableListsAfterProfile: true,
  });

  const handleShare = useProfileShare(username);
  const { activeTab, switchTab } = useProfileTabState();
  const { activity, tabs } = useProfilePresentation({
    reviews,
    complaints,
    reviewsPagination,
    complaintsPagination,
    stats,
  });
  const [followHoverUnfollow, setFollowHoverUnfollow] = useState(false);

  const {
    followers,
    following,
    loadingRelations,
    relationsError,
    followStatusByUsername,
    handleFollowRow,
  } = useProfileRelations({
    activeTab,
    username,
    profileLoaded: Boolean(user),
    reviews,
    currentUser,
  });

  if (!loading && !user) {
    return null;
  }

  const profileUser = user as (typeof user) & { createdAt?: string };
  const joinedStr = formatJoined(profileUser?.createdAt);
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 sm:pt-12 lg:pt-16 pb-16">
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.div
            key="profile-loading"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0.72 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={transition}
          >
            <UserProfileSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key="profile-content"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={transition}
          >
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
                    errorMessage={
                      reviewsError instanceof Error ? reviewsError.message : null
                    }
                    onRetry={() => void refetchReviews()}
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
                    errorMessage={
                      complaintsError instanceof Error ? complaintsError.message : null
                    }
                    onRetry={() => void refetchComplaints()}
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
                    errorMessage={
                      relationsError instanceof Error ? relationsError.message : null
                    }
                    followStatusByUsername={followStatusByUsername}
                    currentUsername={currentUser?.username}
                    onFollow={(targetUsername, currentlyFollowing) =>
                      void handleFollowRow(targetUsername, currentlyFollowing)
                    }
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
                    errorMessage={
                      relationsError instanceof Error ? relationsError.message : null
                    }
                    followStatusByUsername={followStatusByUsername}
                    currentUsername={currentUser?.username}
                    onFollow={(targetUsername, currentlyFollowing) =>
                      void handleFollowRow(targetUsername, currentlyFollowing)
                    }
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
