import ComplaintListCard from "@/features/complaints/components/ComplaintListCard";
import type { Complaint } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import StatePanel from "@/shared/components/ui/StatePanel";
import ProfileListSkeleton from "@/shared/components/ui/ProfileListSkeleton";

interface ProfileComplaintsPanelProps {
  complaints: Complaint[];
  username: string;
  hasMore: boolean;
  loadingMore: boolean;
  loading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onLoadMore: () => void;
}

export default function ProfileComplaintsPanel({
  complaints,
  username,
  hasMore,
  loadingMore,
  loading = false,
  errorMessage = null,
  onRetry,
  onLoadMore,
}: ProfileComplaintsPanelProps) {
  if (loading) {
    return <ProfileListSkeleton variant="complaint" />;
  }

  if (errorMessage) {
    return (
      <StatePanel
        title="Couldn't load complaints"
        message={errorMessage}
        actionLabel={onRetry ? "Try again" : undefined}
        onAction={onRetry}
      />
    );
  }

  if (complaints.length === 0) {
    return <StatePanel title="No complaints yet" message={`Complaints from @${username} will show here.`} />;
  }

  return (
    <>
      <AnimatePresence initial={false}>
        <motion.div
          key={`complaints-${username}-${complaints.length}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={{ willChange: "transform, opacity" }}
          className="space-y-4"
        >
          {complaints.map((complaint, index) => (
            <ComplaintListCard key={complaint.id} complaint={complaint} index={index} />
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
            {loadingMore ? "Loading…" : "Load more complaints"}
          </button>
        </div>
      )}
    </>
  );
}
