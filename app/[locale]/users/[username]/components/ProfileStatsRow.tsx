interface ProfileStats {
  followersCount: number;
  followingCount: number;
  postsCount: number;
  complaintsCount: number;
}

type TabId = "reviews" | "complaints" | "followers" | "following";

interface ProfileStatsRowProps {
  stats: ProfileStats;
  onTabChange: (tab: TabId) => void;
}

export default function ProfileStatsRow({ stats, onTabChange }: ProfileStatsRowProps) {
  return (
    <div className="mt-4 border-t border-[#E5E5E5] pt-4">
      <div className="flex flex-wrap items-center gap-6 text-xs text-text-secondary">
        <button
          type="button"
          onClick={() => onTabChange("followers")}
          className="hover:text-primary transition-colors"
        >
          <span className="font-semibold text-text-primary">{stats.followersCount}</span>{" "}
          Followers
        </button>
        <span className="text-[#E5E5E5]">|</span>
        <button
          type="button"
          onClick={() => onTabChange("following")}
          className="hover:text-primary transition-colors"
        >
          <span className="font-semibold text-text-primary">{stats.followingCount}</span>{" "}
          Following
        </button>
        <span className="text-[#E5E5E5]">|</span>
        <span>
          <span className="font-semibold text-text-primary">{stats.postsCount}</span> Posts
        </span>
        <span className="text-[#E5E5E5]">|</span>
        <span>
          <span className="font-semibold text-text-primary">{stats.complaintsCount}</span>{" "}
          Complaints
        </span>
      </div>
    </div>
  );
}
