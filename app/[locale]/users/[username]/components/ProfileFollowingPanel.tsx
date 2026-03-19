import ProfileUserRow from "@/features/users/components/ProfileUserRow";
import type { Author } from "@/lib/types";
import StatePanel from "@/shared/components/ui/StatePanel";

interface ProfileFollowingPanelProps {
  following: Author[];
  username: string;
  loading: boolean;
  errorMessage?: string | null;
  followStatusByUsername: Record<string, boolean>;
  currentUsername: string | undefined;
  onFollow: (targetUsername: string, currentlyFollowing: boolean) => void;
}

export default function ProfileFollowingPanel({
  following,
  username,
  loading,
  errorMessage = null,
  followStatusByUsername,
  currentUsername,
  onFollow,
}: ProfileFollowingPanelProps) {
  if (loading) {
    return <StatePanel title="Loading following" message="Fetching the latest accounts list." />;
  }

  if (errorMessage) {
    return <StatePanel title="Couldn't load following" message={errorMessage} />;
  }

  if (following.length === 0) {
    return (
      <StatePanel
        title="Not following anyone yet"
        message={`When @${username} follows people, they'll appear here.`}
      />
    );
  }

  return (
    <div className="card-base divide-y divide-[#E5E5E5]">
      {following.map((u) => (
        <ProfileUserRow
          key={u.id}
          user={u}
          isFollowing={followStatusByUsername[u.username] ?? false}
          currentUsername={currentUsername}
          onFollow={onFollow}
        />
      ))}
    </div>
  );
}
