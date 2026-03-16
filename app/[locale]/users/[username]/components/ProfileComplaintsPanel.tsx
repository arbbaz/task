import ComplaintListCard from "@/features/complaints/components/ComplaintListCard";
import type { Complaint } from "@/lib/types";

interface ProfileComplaintsPanelProps {
  complaints: Complaint[];
  username: string;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export default function ProfileComplaintsPanel({
  complaints,
  username,
  hasMore,
  loadingMore,
  onLoadMore,
}: ProfileComplaintsPanelProps) {
  if (complaints.length === 0) {
    return (
      <div className="card-base py-8 text-center text-sm text-text-secondary">
        <p className="font-medium text-text-primary">No complaints yet</p>
        <p className="mt-1">Complaints from @{username} will show here.</p>
      </div>
    );
  }

  return (
    <>
      {complaints.map((complaint, index) => (
        <ComplaintListCard key={complaint.id} complaint={complaint} index={index} />
      ))}
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
