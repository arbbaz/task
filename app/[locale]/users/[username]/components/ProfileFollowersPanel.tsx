import ProfileUserRow from "@/features/users/components/ProfileUserRow";
import type { Author } from "@/lib/types";

interface ProfileFollowersPanelProps {
  followers: Author[];
  username: string;
  loading: boolean;
  followStatusByUsername: Record<string, boolean>;
  currentUsername: string | undefined;
  onFollow: (targetUsername: string, currentlyFollowing: boolean) => void;
}

export default function ProfileFollowersPanel({
  followers,
  username,
  loading,
  followStatusByUsername,
  currentUsername,
  onFollow,
}: ProfileFollowersPanelProps) {
  if (loading) {
    return (
      <div className="card-base py-6 text-center text-sm text-text-secondary">
        Loading followers…
      </div>
    );
  }

  if (followers.length === 0) {
    return (
      <div className="card-base py-8 text-center text-sm text-text-secondary">
        <p className="font-medium text-text-primary">No followers yet</p>
        <p className="mt-1">When someone follows @{username}, they&apos;ll appear here.</p>
      </div>
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
