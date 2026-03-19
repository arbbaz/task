"use client";

import { useMemo } from "react";
import { getActivitySummary } from "@/features/users/utils/profileActivity";
import type { Complaint, Review } from "@/lib/types";
import type {
  ComplaintsPagination,
  ReviewsPagination,
} from "@/features/users/hooks/useProfileQueries";

interface UseProfilePresentationOptions {
  reviews: Review[];
  complaints: Complaint[];
  reviewsPagination: ReviewsPagination | null;
  complaintsPagination: ComplaintsPagination | null;
  stats: {
    followersCount: number;
    followingCount: number;
  } | null;
}

export function useProfilePresentation({
  reviews,
  complaints,
  reviewsPagination,
  complaintsPagination,
  stats,
}: UseProfilePresentationOptions) {
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
      complaints.length,
      complaintsPagination?.total,
      reviews.length,
      reviewsPagination?.total,
      stats?.followersCount,
      stats?.followingCount,
    ],
  );

  return { activity, tabs };
}
