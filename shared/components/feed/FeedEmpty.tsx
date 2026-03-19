"use client";

import StatePanel from "@/shared/components/ui/StatePanel";

interface FeedEmptyProps {
  message: string;
}

export default function FeedEmpty({ message }: FeedEmptyProps) {
  return <StatePanel title="Nothing here yet" message={message} />;
}
