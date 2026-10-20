import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreateSubmissionInput } from "@/types/api";

export const submissionKeys = {
  mine: ["submissions", "mine"] as const,
};

export function useMySubmissions() {
  return useQuery({
    queryKey: submissionKeys.mine,
    queryFn: async () => (await api.submissions.listMine()).submissions,
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSubmissionInput) => api.submissions.create(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: submissionKeys.mine }),
  });
}
