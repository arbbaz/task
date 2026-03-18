import Skeleton from "@/shared/components/ui/Skeleton";

interface ProfileListSkeletonProps {
  count?: number;
}

export default function ProfileListSkeleton({ count = 4 }: ProfileListSkeletonProps) {
  return (
    <div className="space-y-4" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-base rounded-lg p-4 sm:p-5 space-y-4 animate-pulse">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-3/4 max-w-xs" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#E5E5E5]">
            <Skeleton variant="circle" className="h-8 w-8" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

