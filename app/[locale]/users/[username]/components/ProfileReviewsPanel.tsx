import ReviewCard from "@/features/reviews/components/ReviewCard";
import type { Review } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import ProfileListSkeleton from "@/shared/components/ui/ProfileListSkeleton";

interface ProfileReviewsPanelProps {
  reviews: Review[];
  username: string;
  hasMore: boolean;
  loadingMore: boolean;
  loading?: boolean;
  onLoadMore: () => void;
  onVoteUpdate?: (reviewId: string, helpfulCount: number, downVoteCount: number) => void;
  /** Bulk follow status for review authors; avoids per-card follow-status API calls. */
  followStatusByUsername?: Record<string, boolean>;
}

export default function ProfileReviewsPanel({
  reviews,
  username,
  hasMore,
  loadingMore,
  loading = false,
  onLoadMore,
  onVoteUpdate,
  followStatusByUsername = {},
}: ProfileReviewsPanelProps) {
  if (loading) {
    return <ProfileListSkeleton variant="review" />;
  }

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
      <AnimatePresence initial={false}>
        <motion.div
          key={`reviews-${username}-${reviews.length}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={{ willChange: "transform, opacity" }}
          className="space-y-4"
        >
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onVoteUpdate={onVoteUpdate}
              isFollowingAuthor={
                review.author?.username !== undefined
                  ? followStatusByUsername[review.author.username]
                  : false
              }
            />
          ))}
        </motion.div>
      </AnimatePresence>
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
