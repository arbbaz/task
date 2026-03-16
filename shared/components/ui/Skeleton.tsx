interface SkeletonProps {
  /** "box" (default) or "circle" */
  variant?: "box" | "circle";
  className?: string;
}

const skeletonBase = "animate-pulse bg-[#E5E5E5]";

export default function Skeleton({ variant = "box", className = "" }: SkeletonProps) {
  const rounded = variant === "circle" ? "rounded-full" : "rounded";
  return (
    <div className={`${skeletonBase} ${rounded} ${className}`.trim()} />
  );
}
