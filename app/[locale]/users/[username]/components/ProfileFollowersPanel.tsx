import ProfileUserRow from "@/features/users/components/ProfileUserRow";
import type { Author } from "@/lib/types";
import StatePanel from "@/shared/components/ui/StatePanel";

interface ProfileFollowersPanelProps {
  followers: Author[];
  username: string;
  loading: boolean;
  errorMessage?: string | null;
  followStatusByUsername: Record<string, boolean>;
  currentUsername: string | undefined;
  onFollow: (targetUsername: string, currentlyFollowing: boolean) => void;
}

export default function ProfileFollowersPanel({
  followers,
  username,
  loading,
  errorMessage = null,
  followStatusByUsername,
  currentUsername,
  onFollow,
}: ProfileFollowersPanelProps) {
  if (loading) {
    return <StatePanel title="Loading followers" message="Fetching the latest follower list." />;
  }

  if (errorMessage) {
    return <StatePanel title="Couldn't load followers" message={errorMessage} />;
  }

  if (followers.length === 0) {
    return (
      <StatePanel
        title="No followers yet"
        message={`When someone follows @${username}, they'll appear here.`}
      />
    );
  }

  return (
    <div className="card-base divide-y divide-[#E5E5E5]">
      {followers.map((follower) => (
        <ProfileUserRow
          key={follower.id}
          user={follower}
          isFollowing={followStatusByUsername[follower.username] ?? false}
          currentUsername={currentUsername}
          onFollow={onFollow}
        />
      ))}
    </div>
  );
}
