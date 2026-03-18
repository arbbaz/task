"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useReviewFeed } from "@/features/reviews/contexts/ReviewFeedContext";
import CompanyHero from "@/features/reviews/components/CompanyHero";
import ReviewComposer from "@/features/reviews/components/ReviewComposer";
import Skeleton from "@/shared/components/ui/Skeleton";

interface CompanyProfileSectionProps {
  onReviewSubmitted?: (newReview?: unknown) => void;
}

export default function CompanyProfileSection({ onReviewSubmitted }: CompanyProfileSectionProps) {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const { addReview } = useReviewFeed();
  const handleSubmit = onReviewSubmitted ?? addReview;

  return (
    <div className="pt-8 sm:pt-12 lg:pt-16">
      <div className="card-base">
        <CompanyHero isLoggedIn={isLoggedIn} />
        {isLoggedIn ? (
          <ReviewComposer onReviewSubmitted={handleSubmit} />
        ) : isAuthLoading ? (
          <div className="mt-3 card-light p-4" aria-hidden>
            <div className="flex h-auto flex-col items-start gap-2 border-b border-border-light px-3 py-2 sm:h-10 sm:flex-row sm:items-center sm:gap-0 sm:py-0">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-4 w-4" />
                ))}
              </div>
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="mt-3 h-12 w-full" />
            <Skeleton className="mt-3 h-32 w-full" />
            <div className="mt-4 flex justify-end">
              <Skeleton className="h-10 w-32 rounded-full" />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
