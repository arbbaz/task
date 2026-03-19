export const queryKeys = {
  trendingOverview: (period: "week" | "month" = "week") =>
    ["trending-overview", period] as const,
  profile: (username: string) => ["profile", username] as const,
  profileReviews: (username: string, page?: number) =>
    ["profile-reviews", username, page ?? null] as const,
  profileComplaints: (username: string, page?: number) =>
    ["profile-complaints", username, page ?? null] as const,
  profileFollowers: (username: string) => ["profile-followers", username] as const,
  profileFollowing: (username: string) => ["profile-following", username] as const,
  followStatusBulkViewer: (viewerId: string | null) =>
    ["follow-status-bulk", viewerId ?? "anon"] as const,
  followStatusBulk: (viewerId: string | null, usernames: string[]) =>
    ["follow-status-bulk", viewerId ?? "anon", [...usernames].sort()] as const,
};
