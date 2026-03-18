import AppShell from "@/features/layout/components/AppShell";
import UserProfileSkeleton from "@/shared/components/ui/UserProfileSkeleton";

export default function Loading() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:pt-12 lg:pt-16 pb-16">
        <UserProfileSkeleton />
      </div>
    </AppShell>
  );
}

