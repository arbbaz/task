"use client";

import type { VoteType } from "@/lib/types";
import { ArrowDownIcon, ArrowUpIcon } from "@/shared/components/ui/Icons";

function getVoteButtonClass(isActive: boolean): string {
  return `vote-btn ${isActive ? "vote-btn-active" : "vote-btn-idle"} vote-btn-ready`;
}

export interface VoteRailProps {
  helpfulCount: number;
  downVoteCount: number;
  userVote: VoteType | null;
  onVote: (voteType: VoteType) => void;
  disabled?: boolean;
  /** "card" = review card (larger); "comment" = comment item (smaller) */
  variant?: "card" | "comment";
}

const variantClasses = {
  card: {
    rail: "vote-rail",
    count: "vote-count",
    countDown: "vote-count-down",
    iconSize: 20,
  },
  comment: {
    rail: "comment-item-vote-rail",
    count: "comment-item-vote-count",
    countDown: "comment-item-vote-count-down",
    iconSize: 16,
  },
} as const;

export default function VoteRail({
  helpfulCount,
  downVoteCount,
  userVote,
  onVote,
  variant = "card",
}: VoteRailProps) {
  const classes = variantClasses[variant];
  const size = classes.iconSize;

  return (
    <div className={classes.rail}>
      <button
        type="button"
        onClick={() => onVote("UP")}
        className={getVoteButtonClass(userVote === "UP")}
        aria-label="Vote up"
      >
        <ArrowUpIcon
          className={userVote === "UP" ? "drop-shadow-md" : undefined}
          style={{ color: "#00885E", width: size, height: size }}
        />
      </button>
      <span className={classes.count}>{helpfulCount}</span>
      <button
        type="button"
        onClick={() => onVote("DOWN")}
        className={getVoteButtonClass(userVote === "DOWN")}
        aria-label="Vote down"
      >
        <ArrowDownIcon
          className={userVote === "DOWN" ? "drop-shadow-md" : undefined}
          style={{ color: "#EA580C", width: size, height: size }}
        />
      </button>
      <span className={classes.countDown}>{downVoteCount}</span>
    </div>
  );
}
