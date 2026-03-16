"use client";

import Skeleton from "@/shared/components/ui/Skeleton";

const PROFILE_HEADER_LINE_WIDTHS = ["w-36", "w-56", "w-28"] as const;
const STATS_ITEM_WIDTHS = ["w-20", "w-16", "w-14", "w-20", "w-24"] as const;
const TAB_COUNT = 4;
const REVIEW_CARD_COUNT = 5;
const RATING_STAR_COUNT = 5;
const REVIEW_CONTENT_LINES = 3;
const META_ITEM_WIDTHS = ["w-24", "w-20", "w-14", "w-14"] as const;

export default function UserProfileSkeleton() {
  return (
    <div className="min-h-screen w-full animate-pulse">
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:pt-12 lg:pt-16 pb-16">
        {/* Profile card skeleton */}
        <div className="card-base">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Skeleton variant="circle" className="h-14 w-14 flex-shrink-0" />
              <div className="space-y-2">
                {PROFILE_HEADER_LINE_WIDTHS.map((widthClass, i) => (
                  <Skeleton
                    key={i}
                    className={i === 0 ? `h-5 ${widthClass}` : i === 1 ? `h-4 ${widthClass}` : `h-3 ${widthClass}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20 rounded-full" />
              <Skeleton className="h-9 w-24 rounded-full" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 border-t border-[#E5E5E5] pt-4">
            {STATS_ITEM_WIDTHS.map((widthClass, i) => (
              <Skeleton key={i} className={`h-4 ${widthClass}`} />
            ))}
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="mt-6">
          <div className="mb-4 flex gap-1 rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] p-1">
            {Array.from({ length: TAB_COUNT }).map((_, i) => (
              <Skeleton key={i} className="h-9 flex-1 rounded-lg" />
            ))}
          </div>

          {/* Review cards with rating skeletons */}
          <div className="space-y-4">
            {Array.from({ length: REVIEW_CARD_COUNT }).map((_, i) => (
              <div key={i} className="card-base rounded-lg p-4 sm:p-5 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-5 w-3/4 max-w-xs" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: RATING_STAR_COUNT }).map((_, starIndex) => (
                    <Skeleton key={starIndex} className="h-5 w-5" />
                  ))}
                  <Skeleton className="ml-2 h-4 w-8" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: REVIEW_CONTENT_LINES }).map((_, lineIndex) => (
                    <Skeleton
                      key={lineIndex}
                      className={lineIndex < REVIEW_CONTENT_LINES - 1 ? "h-3 w-full" : "h-3 w-4/5"}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#E5E5E5]">
                  <Skeleton variant="circle" className="h-8 w-8" />
                  {META_ITEM_WIDTHS.map((widthClass, metaIndex) => (
                    <Skeleton
                      key={metaIndex}
                      className={metaIndex === 1 ? `h-4 ${widthClass}` : `h-3 ${widthClass}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
