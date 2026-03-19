"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/client";
import {
  useFollowersQuery,
  useFollowingQuery,
  useFollowStatusBulkQuery,
} from "@/features/users/hooks/useProfileQueries";
import { syncFollowStatusBulkCaches } from "@/features/users/utils/followStatusCache";
import { safeApiMessage } from "@/lib/apiErrors";
import { useToast } from "@/lib/contexts/ToastContext";
import type { Review } from "@/lib/types";
import type { TabId } from "../components";

interface UseProfileRelationsOptions {
  activeTab: TabId;
  username: string;
  profileLoaded: boolean;
  reviews: Review[];
  currentUser: { id?: string | null; username?: string | null } | null;
}

export function useProfileRelations({
  activeTab,
  username,
  profileLoaded,
  reviews,
  currentUser,
}: UseProfileRelationsOptions) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const followersQuery = useFollowersQuery(
    username,
    profileLoaded && activeTab === "followers",
  );
  const followingQuery = useFollowingQuery(
    username,
    profileLoaded && activeTab === "following",
  );
  const followers = followersQuery.data ?? [];
  const following = followingQuery.data ?? [];
  const loadingRelations =
    activeTab === "followers" ? followersQuery.isLoading : followingQuery.isLoading;
  const relationsError =
    activeTab === "followers" ? followersQuery.error : followingQuery.error;

  const relationUsernames = activeTab === "followers"
    ? followers.map((u) => u.username).filter(Boolean)
    : following.map((u) => u.username).filter(Boolean);

  const followStatusQuery = useFollowStatusBulkQuery(
    relationUsernames,
    profileLoaded &&
      (activeTab === "followers" || activeTab === "following") &&
      relationUsernames.length > 0,
    currentUser?.id ?? null,
  );

  const reviewAuthorUsernames = useMemo(
    () => [...new Set(reviews.map((r) => r.author?.username).filter(Boolean))] as string[],
    [reviews],
  );

  const reviewAuthorsFollowQuery = useFollowStatusBulkQuery(
    reviewAuthorUsernames,
    profileLoaded && activeTab === "reviews" && reviewAuthorUsernames.length > 0,
    currentUser?.id ?? null,
  );

  const followStatusByUsername =
    activeTab === "reviews"
      ? (reviewAuthorsFollowQuery.data?.following ?? {})
      : (followStatusQuery.data?.following ?? {});

  const handleFollowRow = async (targetUsername: string, currentlyFollowing: boolean) => {
    const nextFollowing = !currentlyFollowing;

    syncFollowStatusBulkCaches(
      queryClient,
      currentUser?.id ?? null,
      targetUsername,
      nextFollowing,
    );

    const response = nextFollowing
      ? await usersApi.follow(targetUsername)
      : await usersApi.unfollow(targetUsername);

    if (response.error) {
      syncFollowStatusBulkCaches(
        queryClient,
        currentUser?.id ?? null,
        targetUsername,
        currentlyFollowing,
      );
      showToast(safeApiMessage(response.error), "error");
    }
  };

  return {
    followers,
    following,
    loadingRelations,
    relationsError,
    followStatusByUsername,
    handleFollowRow,
  };
}
