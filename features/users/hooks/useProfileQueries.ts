"use client";

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { complaintsApi } from "@/features/complaints/api/client";
import { reviewsApi } from "@/features/reviews/api/client";
import { usersApi } from "@/features/users/api/client";
import type { UserProfileResponse } from "@/features/users/api/client";
import { useToast } from "@/lib/contexts/ToastContext";
import { queryKeys } from "@/lib/queryKeys";
import type { Complaint, Review } from "@/lib/types";
import { syncFollowStatusBulkCaches } from "@/features/users/utils/followStatusCache";

const PAGE_SIZE = 10;

export interface ReviewsPagination {
  page: number;
  total: number;
  totalPages: number;
}

export interface ComplaintsPagination {
  page: number;
  total: number;
  totalPages: number;
}

export function useProfileQueries(
  username: string,
  options?: {
    /**
     * When true, loads reviews/complaints only after profile has loaded (waterfall).
     * Improves LCP by not competing with the profile request.
     */
    enableListsAfterProfile?: boolean;
  },
) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { isLoggedIn, user: currentUser } = useAuth();

  const profileQuery = useQuery({
    queryKey: queryKeys.profile(username),
    queryFn: async (): Promise<UserProfileResponse> => {
      const res = await usersApi.getProfile(username);
      if (res.error) throw new Error(res.error);
      if (!res.data) throw new Error("Profile not found");
      return res.data;
    },
    enabled: !!username,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const profileLoaded = !!profileQuery.data;
  const enableLists = options?.enableListsAfterProfile ? profileLoaded : true;

  const reviewsInfinite = useInfiniteQuery({
    queryKey: [...queryKeys.profileReviews(username)],
    queryFn: async ({ pageParam }) => {
      const res = await reviewsApi.list({
        username,
        limit: PAGE_SIZE,
        page: pageParam,
      });
      if (res.error) throw new Error(res.error);
      return {
        reviews: res.data?.reviews ?? [],
        pagination: res.data?.pagination ?? res.pagination,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const p = lastPage.pagination;
      if (!p || p.page >= p.totalPages) return undefined;
      return p.page + 1;
    },
    enabled: !!username && enableLists,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const complaintsInfinite = useInfiniteQuery({
    queryKey: [...queryKeys.profileComplaints(username)],
    queryFn: async ({ pageParam }) => {
      const res = await complaintsApi.list({
        username,
        limit: PAGE_SIZE,
        page: pageParam,
      });
      if (res.error) throw new Error(res.error);
      return {
        complaints: res.data?.complaints ?? [],
        pagination: res.data?.pagination ?? res.pagination,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const p = lastPage.pagination;
      if (!p || p.page >= p.totalPages) return undefined;
      return p.page + 1;
    },
    enabled: !!username && enableLists,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const followMutation = useMutation({
    mutationFn: async ({
      username: targetUsername,
      follow,
    }: {
      username: string;
      follow: boolean;
    }) => {
      if (follow) {
        const res = await usersApi.follow(targetUsername);
        if (res.error) throw new Error(res.error);
        return { following: true };
      }
      const res = await usersApi.unfollow(targetUsername);
      if (res.error) throw new Error(res.error);
      return { following: false };
    },
    onMutate: async (variables) => {
      const profileKey = queryKeys.profile(variables.username);
      const previousProfile = queryClient.getQueryData<UserProfileResponse>(profileKey);

      queryClient.setQueryData<UserProfileResponse | undefined>(profileKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          stats: {
            ...current.stats,
            followersCount: Math.max(
              0,
              current.stats.followersCount + (variables.follow ? 1 : -1),
            ),
          },
          viewerState: {
            ...current.viewerState,
            isFollowing: variables.follow,
          },
        };
      });

      syncFollowStatusBulkCaches(
        queryClient,
        currentUser?.id ?? null,
        variables.username,
        variables.follow,
      );

      return { previousProfile };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profileFollowers(variables.username) });
      if (currentUser?.username) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.profileFollowing(currentUser.username),
        });
      }
    },
    onError: (err, variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(
          queryKeys.profile(variables.username),
          context.previousProfile,
        );
      }
      syncFollowStatusBulkCaches(
        queryClient,
        currentUser?.id ?? null,
        variables.username,
        !variables.follow,
      );
      showToast(err instanceof Error ? err.message : "Failed to update follow", "error");
    },
  });

  const user = profileQuery.data?.user ?? null;
  const stats = profileQuery.data?.stats ?? null;
  const isFollowing = profileQuery.data?.viewerState?.isFollowing ?? false;

  const reviews = reviewsInfinite.data?.pages.flatMap((p) => p.reviews) ?? [];
  const lastReviewsPage = reviewsInfinite.data?.pages.at(-1);
  const reviewsPagination: ReviewsPagination | null = lastReviewsPage?.pagination
    ? {
        page: lastReviewsPage.pagination.page,
        total: lastReviewsPage.pagination.total,
        totalPages: lastReviewsPage.pagination.totalPages,
      }
    : null;

  const complaints = complaintsInfinite.data?.pages.flatMap((p) => p.complaints) ?? [];
  const lastComplaintsPage = complaintsInfinite.data?.pages.at(-1);
  const complaintsPagination: ComplaintsPagination | null = lastComplaintsPage?.pagination
    ? {
        page: lastComplaintsPage.pagination.page,
        total: lastComplaintsPage.pagination.total,
        totalPages: lastComplaintsPage.pagination.totalPages,
      }
    : null;

  const loading =
    profileQuery.isLoading ||
    (profileQuery.isFetching && !profileQuery.data);

  const loadingReviews =
    reviewsInfinite.isLoading ||
    (reviewsInfinite.isFetching && !reviewsInfinite.data);
  const loadingComplaints =
    complaintsInfinite.isLoading ||
    (complaintsInfinite.isFetching && !complaintsInfinite.data);

  const toggleFollow = useCallback(() => {
    if (!user) return;
    followMutation.mutate({
      username: user.username,
      follow: !isFollowing,
    });
  }, [user, isFollowing, followMutation]);

  const loadMoreReviews = () => {
    if (reviewsInfinite.hasNextPage && !reviewsInfinite.isFetchingNextPage) {
      reviewsInfinite.fetchNextPage();
    }
  };

  const loadMoreComplaints = () => {
    if (complaintsInfinite.hasNextPage && !complaintsInfinite.isFetchingNextPage) {
      complaintsInfinite.fetchNextPage();
    }
  };

  const updateReviewVote = useCallback(
    (reviewId: string, helpfulCount: number, downVoteCount: number) => {
      queryClient.setQueriesData(
        { queryKey: queryKeys.profileReviews(username) },
        (old: unknown) => {
          const data = old as { pages: { reviews: Review[]; pagination: unknown }[] } | undefined;
          if (!data?.pages) return old;
          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              reviews: page.reviews.map((r) =>
                r.id === reviewId
                  ? {
                      ...r,
                      helpfulCount,
                      downVoteCount,
                      _count: { ...r._count, helpfulVotes: helpfulCount },
                    }
                  : r
              ),
            })),
          };
        }
      );
    },
    [queryClient, username]
  );

  const updateComplaintVote = useCallback(
    (complaintId: string, helpfulCount: number, downVoteCount: number) => {
      queryClient.setQueriesData(
        { queryKey: queryKeys.profileComplaints(username) },
        (old: unknown) => {
          const data = old as { pages: { complaints: Complaint[]; pagination: unknown }[] } | undefined;
          if (!data?.pages) return old;
          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              complaints: page.complaints.map((c) =>
                c.id === complaintId ? { ...c, helpfulCount, downVoteCount } : c
              ),
            })),
          };
        }
      );
    },
    [queryClient, username]
  );

  return {
    isLoggedIn,
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
    loadingMoreReviews: reviewsInfinite.isFetchingNextPage,
    loadingMoreComplaints: complaintsInfinite.isFetchingNextPage,
    refetchProfile: profileQuery.refetch,
    refetchReviews: reviewsInfinite.refetch,
    refetchComplaints: complaintsInfinite.refetch,
    toggleFollow,
    loadMoreReviews,
    loadMoreComplaints,
    updateReviewVote,
    updateComplaintVote,
    profileError: profileQuery.error,
    reviewsError: reviewsInfinite.error,
    complaintsError: complaintsInfinite.error,
  };
}

export function useFollowersQuery(username: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.profileFollowers(username),
    queryFn: async () => {
      const res = await usersApi.followers(username);
      if (res.error) throw new Error(res.error);
      if (!res.data) throw new Error("Failed to load followers");
      return res.data.users;
    },
    enabled: !!username && enabled,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useFollowingQuery(username: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.profileFollowing(username),
    queryFn: async () => {
      const res = await usersApi.following(username);
      if (res.error) throw new Error(res.error);
      if (!res.data) throw new Error("Failed to load following");
      return res.data.users;
    },
    enabled: !!username && enabled,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useFollowStatusBulkQuery(
  usernames: string[],
  enabled: boolean,
  viewerId: string | null
) {
  return useQuery({
    queryKey: queryKeys.followStatusBulk(viewerId, usernames),
    queryFn: async () => {
      const res = await usersApi.getFollowStatusBulk(usernames);
      if (res.error) throw new Error(res.error);
      if (!res.data) return { following: {} as Record<string, boolean> };
      return res.data;
    },
    enabled: enabled && usernames.length > 0 && !!viewerId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
