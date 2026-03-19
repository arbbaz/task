"use client";

export default function RouteTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-full">{children}</div>;
}
