"use client";

import { useCallback, useEffect, useState } from "react";
import { authApi } from "@/features/auth/api/client";
import { complaintsApi } from "@/features/complaints/api/client";
import { reviewsApi } from "@/features/reviews/api/client";
import { usersApi } from "@/features/users/api/client";
import { useToast } from "@/lib/contexts/ToastContext";
import type { Complaint, Review, UserProfile } from "@/lib/types";

const PAGE_SIZE = 10;

function isAuthFailureMessage(message: string): boolean {
  return /unauthorized|authentication required/i.test(message);
}

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

export function useUserProfileData(username: string) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<{
    followersCount: number;
    followingCount: number;
    postsCount: number;
    complaintsCount: number;
  } | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [reviewsPagination, setReviewsPagination] = useState<ReviewsPagination | null>(null);
  const [complaintsPagination, setComplaintsPagination] =
    useState<ComplaintsPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const [loadingMoreComplaints, setLoadingMoreComplaints] = useState(false);
  const { showToast } = useToast();

  const fetchUserProfile = useCallback(async () => {
    if (!username) return;

    setLoading(true);
    try {
      const profileResponse = await usersApi.getProfile(username);
      const [reviewsResponse, complaintsResponse] = await Promise.all([
        reviewsApi.list({ username, limit: PAGE_SIZE, page: 1 }),
        complaintsApi.list({ username, limit: PAGE_SIZE, page: 1 }),
      ]);

      if (profileResponse.error) {
        showToast(profileResponse.error, "error");
      }
      if (reviewsResponse.error) {
        showToast(reviewsResponse.error, "error");
      }
      if (complaintsResponse.error) {
        showToast(complaintsResponse.error, "error");
      }

      const profileData = profileResponse.data;
      if (profileData) {
        setUser(profileData.user);
        setStats(profileData.stats);
        setIsFollowing(profileData.viewerState.isFollowing);
      } else {
        setUser(null);
        setStats(null);
        setIsFollowing(false);
      }

      const userReviews = reviewsResponse.data?.reviews ?? [];
      const paginationReviews = reviewsResponse.data?.pagination ?? reviewsResponse.pagination;
      setReviews(userReviews);
      if (paginationReviews) {
        setReviewsPagination({
          page: paginationReviews.page,
          total: paginationReviews.total,
          totalPages: paginationReviews.totalPages,
        });
      } else {
        setReviewsPagination(
          userReviews.length > 0
            ? { page: 1, total: userReviews.length, totalPages: 1 }
            : null,
        );
      }

      const userComplaints = complaintsResponse.data?.complaints ?? [];
      const paginationComplaints =
        complaintsResponse.data?.pagination ?? complaintsResponse.pagination;
      setComplaints(userComplaints);
      if (paginationComplaints) {
        setComplaintsPagination({
          page: paginationComplaints.page,
          total: paginationComplaints.total,
          totalPages: paginationComplaints.totalPages,
        });
      } else {
        setComplaintsPagination(
          userComplaints.length > 0
            ? { page: 1, total: userComplaints.length, totalPages: 1 }
            : null,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load profile.";
      console.error("Error fetching user profile:", error);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [username, showToast]);

  useEffect(() => {
    void authApi.me().then((response) => {
      setIsLoggedIn(Boolean(response.data?.user));
      if (response.error && !isAuthFailureMessage(response.error)) {
        showToast(response.error, "error");
      }
    });
  }, [showToast]);

  useEffect(() => {
    void fetchUserProfile();
  }, [fetchUserProfile]);

  const loadMoreReviews = useCallback(async () => {
    if (!username || loadingMoreReviews) return;
    const nextPage = (reviewsPagination?.page ?? 1) + 1;
    if (reviewsPagination && nextPage > reviewsPagination.totalPages) return;

    setLoadingMoreReviews(true);
    try {
      const response = await reviewsApi.list({
        username,
        limit: PAGE_SIZE,
        page: nextPage,
      });
      const newReviews = response.data?.reviews ?? [];
      const pagination = response.data?.pagination ?? response.pagination;
      if (newReviews.length > 0) {
        setReviews((prev) => [...prev, ...newReviews]);
      }
      if (pagination) {
        setReviewsPagination({
          page: pagination.page,
          total: pagination.total,
          totalPages: pagination.totalPages,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load more reviews.";
      showToast(message, "error");
    } finally {
      setLoadingMoreReviews(false);
    }
  }, [username, reviewsPagination, loadingMoreReviews, showToast]);

  const loadMoreComplaints = useCallback(async () => {
    if (!username || loadingMoreComplaints) return;
    const nextPage = (complaintsPagination?.page ?? 1) + 1;
    if (complaintsPagination && nextPage > complaintsPagination.totalPages) return;

    setLoadingMoreComplaints(true);
    try {
      const response = await complaintsApi.list({
        username,
        limit: PAGE_SIZE,
        page: nextPage,
      });
      const newComplaints = response.data?.complaints ?? [];
      const pagination = response.data?.pagination ?? response.pagination;
      if (newComplaints.length > 0) {
        setComplaints((prev) => [...prev, ...newComplaints]);
      }
      if (pagination) {
        setComplaintsPagination({
          page: pagination.page,
          total: pagination.total,
          totalPages: pagination.totalPages,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load more complaints.";
      showToast(message, "error");
    } finally {
      setLoadingMoreComplaints(false);
    }
  }, [username, complaintsPagination, loadingMoreComplaints, showToast]);

  const toggleFollow = useCallback(async () => {
    if (!user) return;
    try {
      if (isFollowing) {
        const response = await usersApi.unfollow(user.username);
        if (!response.error) {
          setIsFollowing(false);
          setStats((prev) =>
            prev
              ? { ...prev, followersCount: Math.max(0, prev.followersCount - 1) }
              : prev,
          );
        } else {
          showToast(response.error, "error");
        }
      } else {
        const response = await usersApi.follow(user.username);
        if (!response.error) {
          setIsFollowing(true);
          setStats((prev) => (prev ? { ...prev, followersCount: prev.followersCount + 1 } : prev));
        } else {
          showToast(response.error, "error");
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update follow status.";
      showToast(message, "error");
    }
  }, [user, isFollowing, showToast]);

  const updateReviewVote = (reviewId: string, helpfulCount: number, downVoteCount: number) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              helpfulCount,
              downVoteCount,
              _count: {
                ...review._count,
                helpfulVotes: helpfulCount,
              },
            }
          : review
      )
    );
  };

  const updateComplaintVote = (
    complaintId: string,
    helpfulCount: number,
    downVoteCount: number,
  ) => {
    setComplaints((prevComplaints) =>
      prevComplaints.map((complaint) =>
        complaint.id === complaintId
          ? { ...complaint, helpfulCount, downVoteCount }
          : complaint
      )
    );
  };

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
    loadingMoreReviews,
    loadingMoreComplaints,
    fetchUserProfile,
    toggleFollow,
    loadMoreReviews,
    loadMoreComplaints,
    updateReviewVote,
    updateComplaintVote,
  };
}
