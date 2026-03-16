interface ActivitySummary {
  reviewsThisMonth: number;
  complaintsThisMonth: number;
  lastActivityLabel: string | null;
}

interface ProfileActivitySummaryProps {
  activity: ActivitySummary;
}

export default function ProfileActivitySummary({ activity }: ProfileActivitySummaryProps) {
  const hasActivity =
    activity.reviewsThisMonth > 0 ||
    activity.complaintsThisMonth > 0 ||
    activity.lastActivityLabel;

  if (!hasActivity) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#E5E5E5] pt-4 text-xs text-text-secondary">
      {activity.reviewsThisMonth > 0 && (
        <span>
          <span className="font-semibold text-text-primary">
            {activity.reviewsThisMonth}
          </span>{" "}
          review{activity.reviewsThisMonth !== 1 ? "s" : ""} this month
        </span>
      )}
      {activity.complaintsThisMonth > 0 && (
        <span>
          <span className="font-semibold text-text-primary">
            {activity.complaintsThisMonth}
          </span>{" "}
          complaint{activity.complaintsThisMonth !== 1 ? "s" : ""} this month
        </span>
      )}
      {activity.lastActivityLabel && (
        <span>
          Last active:{" "}
          <span className="font-medium text-text-primary">
            {activity.lastActivityLabel}
          </span>
        </span>
      )}
    </div>
  );
}
