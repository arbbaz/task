"use client";

import { Link } from "@/i18n/routing";
import type { Author } from "@/lib/types";

interface ProfileUserRowProps {
  user: Author;
  isFollowing: boolean;
  currentUsername: string | undefined;
  onFollow: (username: string, currentlyFollowing: boolean) => void;
}

export default function ProfileUserRow({
  user,
  isFollowing,
  currentUsername,
  onFollow,
}: ProfileUserRowProps) {
  const showFollow =
    currentUsername && user.username && user.username !== currentUsername;

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <Link
        href={`/users/${encodeURIComponent(user.username)}`}
        className="flex min-w-0 flex-1 items-center gap-3 transition hover:opacity-90"
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary">
          {user.username?.slice(0, 2) ?? "?"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-primary">@{user.username}</p>
          {user.bio && (
            <p className="truncate text-xs text-text-secondary">{user.bio}</p>
          )}
        </div>
      </Link>
      {showFollow && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onFollow(user.username, isFollowing);
          }}
          className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
            isFollowing
              ? "border border-[#E5E5E5] bg-white text-text-secondary hover:border-primary hover:text-primary"
              : "btn-primary"
          }`}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      )}
    </div>
  );
}
