export function formatJoined(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } catch {
    return null;
  }
}

export function getActivitySummary(
  reviews: { createdAt: string }[],
  complaints: { createdAt: string }[],
): {
  reviewsThisMonth: number;
  complaintsThisMonth: number;
  lastActivityLabel: string | null;
} {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const isThisMonth = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    } catch {
      return false;
    }
  };
  const reviewsThisMonth = reviews.filter((r) => isThisMonth(r.createdAt)).length;
  const complaintsThisMonth = complaints.filter((c) => isThisMonth(c.createdAt)).length;
  const all = [...reviews, ...complaints].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const last = all[0];
  let lastActivityLabel: string | null = null;
  if (last) {
    const diffDays = Math.floor(
      (now.getTime() - new Date(last.createdAt).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) lastActivityLabel = "Today";
    else if (diffDays === 1) lastActivityLabel = "Yesterday";
    else if (diffDays < 7) lastActivityLabel = `${diffDays} days ago`;
    else if (diffDays < 30) lastActivityLabel = `${Math.floor(diffDays / 7)} weeks ago`;
    else
      lastActivityLabel = new Date(last.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
  }
  return { reviewsThisMonth, complaintsThisMonth, lastActivityLabel };
}
