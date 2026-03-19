import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

interface FollowStatusBulkCache {
  following: Record<string, boolean>;
}

export function syncFollowStatusBulkCaches(
  queryClient: QueryClient,
  viewerId: string | null,
  targetUsername: string,
  isFollowing: boolean,
) {
  const matches = queryClient.getQueriesData<FollowStatusBulkCache>({
    queryKey: queryKeys.followStatusBulkViewer(viewerId),
  });

  for (const [key, data] of matches) {
    if (!data?.following || !(targetUsername in data.following)) {
      continue;
    }

    queryClient.setQueryData<FollowStatusBulkCache>(key, {
      ...data,
      following: {
        ...data.following,
        [targetUsername]: isFollowing,
      },
    });
  }
}
