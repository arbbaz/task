import VerifiedBadge from "./VerifiedBadge";
import type { UserProfile } from "@/lib/types";

interface ProfileHeaderProps {
  user: UserProfile;
  joinedStr: string | null;
  isLoggedIn: boolean;
  isFollowing: boolean;
  followHoverUnfollow: boolean;
  onFollow: () => void;
  onFollowHover: (hover: boolean) => void;
  onShare: () => void;
}

export default function ProfileHeader({
  user,
  joinedStr,
  isLoggedIn,
  isFollowing,
  followHoverUnfollow,
  onFollow,
  onFollowHover,
  onShare,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-semibold uppercase text-primary ring-2 ring-primary/20">
          {user?.username?.slice(0, 2) ?? "US"}
        </div>
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-semibold text-text-primary">
            @{user?.username}
            {user?.verified && <VerifiedBadge />}
          </h1>
          {user?.bio && <p className="mt-1 text-sm text-text-secondary">{user.bio}</p>}
          {joinedStr && (
            <p className="mt-1 text-xs text-text-secondary">Joined {joinedStr}</p>
          )}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onShare}
          className="flex h-9 items-center gap-1.5 rounded-full border border-[#E5E5E5] bg-white px-3 text-xs font-semibold text-text-secondary transition hover:border-primary hover:text-primary"
          aria-label="Share profile"
        >
          <svg
            className="h-4 w-4"
            aria-hidden
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Share
        </button>
        {isLoggedIn && user && (
          <button
            type="button"
            onClick={() => void onFollow()}
            onMouseEnter={() => onFollowHover(true)}
            onMouseLeave={() => onFollowHover(false)}
            aria-label={
              isFollowing
                ? followHoverUnfollow
                  ? `Unfollow @${user.username}`
                  : `Following @${user.username}`
                : `Follow @${user.username}`
            }
            className={`h-9 rounded-full px-4 text-xs font-semibold transition ${
              isFollowing
                ? "border border-primary bg-white text-primary hover:border-alert-red hover:bg-alert-red/5 hover:text-alert-red"
                : "btn-primary"
            }`}
          >
            {isFollowing ? (followHoverUnfollow ? "Unfollow" : "Following") : "Follow"}
          </button>
        )}
      </div>
    </div>
  );
}
