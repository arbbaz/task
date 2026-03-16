import ReviewCard from "@/features/reviews/components/ReviewCard";
import type { Review } from "@/lib/types";

interface ProfileReviewsPanelProps {
  reviews: Review[];
  username: string;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export default function ProfileReviewsPanel({
  reviews,
  username,
  hasMore,
  loadingMore,
  onLoadMore,
}: ProfileReviewsPanelProps) {
  if (reviews.length === 0) {
    return (
      <div className="card-base py-8 text-center text-sm text-text-secondary">
        <p className="font-medium text-text-primary">No reviews yet</p>
        <p className="mt-1">Reviews from @{username} will show here.</p>
      </div>
    );
  }

  return (
    <>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => void onLoadMore()}
            disabled={loadingMore}
            className="rounded-full border border-[#E5E5E5] bg-white px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more reviews"}
          </button>
        </div>
      )}
    </>
  );
}
