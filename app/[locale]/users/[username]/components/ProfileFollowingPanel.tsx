import ProfileUserRow from "@/features/users/components/ProfileUserRow";
import type { Author } from "@/lib/types";

interface ProfileFollowingPanelProps {
  following: Author[];
  username: string;
  loading: boolean;
  followStatusByUsername: Record<string, boolean>;
  currentUsername: string | undefined;
  onFollow: (targetUsername: string, currentlyFollowing: boolean) => void;
  locale: string;
}

export default function ProfileFollowingPanel({
  following,
  username,
  loading,
  followStatusByUsername,
  currentUsername,
  onFollow,
  locale,
}: ProfileFollowingPanelProps) {
  if (loading) {
    return (
      <div className="card-base py-6 text-center text-sm text-text-secondary">
        Loading following…
      </div>
    );
  }

  if (following.length === 0) {
    return (
      <div className="card-base py-8 text-center text-sm text-text-secondary">
        <p className="font-medium text-text-primary">Not following anyone yet</p>
        <p className="mt-1">When @{username} follows people, they&apos;ll appear here.</p>
      </div>
    );
  }

  return (
    <div className="card-base divide-y divide-[#E5E5E5]">
      {following.map((u) => (
        <ProfileUserRow
          key={u.id}
          user={u}
          locale={locale}
          isFollowing={followStatusByUsername[u.username] ?? false}
          currentUsername={currentUsername}
          onFollow={onFollow}
        />
      ))}
    </div>
  );
}
