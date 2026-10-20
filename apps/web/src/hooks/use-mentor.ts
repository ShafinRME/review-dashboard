import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ListParams, ReviewInput } from "@/types/api";

export const mentorKeys = {
  all: ["mentor"] as const,
  stats: ["mentor", "stats"] as const,
  list: (params: ListParams) => ["mentor", "submissions", params] as const,
};

export function useMentorStats() {
  return useQuery({
    queryKey: mentorKeys.stats,
    queryFn: () => api.mentor.stats(),
  });
}

export function useMentorSubmissions(params: ListParams) {
  return useQuery({
    queryKey: mentorKeys.list(params),
    queryFn: () => api.mentor.list(params),
    // Keep showing the previous page while the next one loads, so the table does not flash empty.
    placeholderData: keepPreviousData,
  });
}

export function useReviewSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReviewInput }) =>
      api.mentor.review(id, input),
    // Invalidating the "mentor" prefix refreshes both the stats and every cached list page.
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: mentorKeys.all }),
  });
}
