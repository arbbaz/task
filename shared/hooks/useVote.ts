"use client";

import { useEffect, useRef, useState } from "react";
import type { ApiResponse } from "@/lib/api/core";
import type { VoteResponse, VoteType } from "@/lib/types";

type VoteRequest = (id: string, voteType: VoteType) => Promise<ApiResponse<VoteResponse>>;

interface UseVoteOptions {
  entityId: string;
  initialHelpfulCount?: number;
  initialDownVoteCount?: number;
  initialUserVote?: VoteType | null;
  voteRequest: VoteRequest;
  onSuccess?: (helpfulCount: number, downVoteCount: number, voteType: VoteType | null) => void;
}

/** Applies initial counts only when entityId changes (new entity). After that, state updates only from server response to avoid flicker when parent re-renders. */
export function useVote({
  entityId,
  initialHelpfulCount = 0,
  initialDownVoteCount = 0,
  initialUserVote = null,
  voteRequest,
  onSuccess,
}: UseVoteOptions) {
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount);
  const [downVoteCount, setDownVoteCount] = useState(initialDownVoteCount);
  const [userVote, setUserVote] = useState<VoteType | null>(initialUserVote);
  const prevEntityIdRef = useRef<string | null>(null);
  const isVotingRef = useRef(false);
  const queuedVoteRef = useRef<VoteType | null>(null);
  const confirmedStateRef = useRef({
    helpfulCount: initialHelpfulCount,
    downVoteCount: initialDownVoteCount,
    userVote: initialUserVote,
  });
  const optimisticStateRef = useRef({
    helpfulCount: initialHelpfulCount,
    downVoteCount: initialDownVoteCount,
    userVote: initialUserVote,
  });

  const getNextVoteState = (
    currentVote: VoteType | null,
    nextVote: VoteType,
    currentHelpfulCount: number,
    currentDownVoteCount: number,
  ) => {
    const resolvedVoteType = currentVote === nextVote ? null : nextVote;
    const helpfulDelta =
      (resolvedVoteType === "UP" ? 1 : 0) - (currentVote === "UP" ? 1 : 0);
    const downDelta =
      (resolvedVoteType === "DOWN" ? 1 : 0) - (currentVote === "DOWN" ? 1 : 0);

    return {
      userVote: resolvedVoteType,
      helpfulCount: Math.max(0, currentHelpfulCount + helpfulDelta),
      downVoteCount: Math.max(0, currentDownVoteCount + downDelta),
    };
  };

  // Apply initial values only when entityId changes (new entity). Avoids flicker from parent re-renders.
  useEffect(() => {
    if (prevEntityIdRef.current !== entityId) {
      prevEntityIdRef.current = entityId;
      setHelpfulCount(initialHelpfulCount);
      setDownVoteCount(initialDownVoteCount);
      setUserVote(initialUserVote);
      confirmedStateRef.current = {
        helpfulCount: initialHelpfulCount,
        downVoteCount: initialDownVoteCount,
        userVote: initialUserVote,
      };
      optimisticStateRef.current = {
        helpfulCount: initialHelpfulCount,
        downVoteCount: initialDownVoteCount,
        userVote: initialUserVote,
      };
      queuedVoteRef.current = null;
      isVotingRef.current = false;
    }
  }, [entityId, initialHelpfulCount, initialDownVoteCount, initialUserVote]);

  const applyState = (
    nextState: {
      helpfulCount: number;
      downVoteCount: number;
      userVote: VoteType | null;
    },
  ) => {
    optimisticStateRef.current = nextState;
    setHelpfulCount(nextState.helpfulCount);
    setDownVoteCount(nextState.downVoteCount);
    setUserVote(nextState.userVote);
    onSuccess?.(
      nextState.helpfulCount,
      nextState.downVoteCount,
      nextState.userVote,
    );
  };

  const flushVoteQueue = async () => {
    if (isVotingRef.current) return;

    isVotingRef.current = true;
    try {
      while (queuedVoteRef.current) {
        const voteToSend = queuedVoteRef.current;
        queuedVoteRef.current = null;

        const response = await voteRequest(entityId, voteToSend);
        if (response.error || !response.data) {
          applyState(confirmedStateRef.current);
          queuedVoteRef.current = null;
          return;
        }

        const confirmedState = {
          helpfulCount: response.data.helpfulCount,
          downVoteCount: response.data.downVoteCount,
          userVote: response.data.voteType,
        };
        confirmedStateRef.current = confirmedState;

        if (!queuedVoteRef.current) {
          applyState(confirmedState);
        }
      }
    } catch (error) {
      applyState(confirmedStateRef.current);
      queuedVoteRef.current = null;
      console.error("Error voting:", error);
    } finally {
      isVotingRef.current = false;
    }
  };

  const handleVote = (voteType: VoteType) => {
    const optimisticState = getNextVoteState(
      optimisticStateRef.current.userVote,
      voteType,
      optimisticStateRef.current.helpfulCount,
      optimisticStateRef.current.downVoteCount,
    );

    queuedVoteRef.current = voteType;
    applyState(optimisticState);
    void flushVoteQueue();
  };

  return {
    helpfulCount,
    downVoteCount,
    userVote,
    isUpVoted: userVote === "UP",
    isDownVoted: userVote === "DOWN",
    handleVote,
  };
}
