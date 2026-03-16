export type TabId = "reviews" | "complaints" | "followers" | "following";

export interface ProfileTab {
  id: TabId;
  label: string;
  count: number;
}

interface ProfileTabListProps {
  tabs: ProfileTab[];
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function ProfileTabList({
  tabs,
  activeTab,
  onTabChange,
}: ProfileTabListProps) {
  return (
    <div
      className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] p-1"
      role="tablist"
      aria-label="Profile sections"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          id={`tab-${tab.id}`}
          onClick={() => onTabChange(tab.id)}
          className={`min-w-[80px] flex-shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            activeTab === tab.id
              ? "bg-white text-primary shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
}
