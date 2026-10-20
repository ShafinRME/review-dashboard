import type { SubmissionStatus } from "@/types/api";

export const PAGE_SIZE = 10;
export const STATUSES: SubmissionStatus[] = ["PENDING", "APPROVED", "REJECTED"];

export interface ListState {
  status?: SubmissionStatus;
  search: string;
  page: number;
}

// Reads the table state from the URL. Anything invalid falls back to a safe default.
export function parseListState(params: {
  get(name: string): string | null;
}): ListState {
  const status = params.get("status");
  const page = Number.parseInt(params.get("page") ?? "1", 10);

  return {
    status: STATUSES.includes(status as SubmissionStatus)
      ? (status as SubmissionStatus)
      : undefined,
    search: (params.get("search") ?? "").slice(0, 100),
    page: Number.isFinite(page) && page >= 1 ? page : 1,
  };
}

export function toSearchString(state: ListState) {
  const qs = new URLSearchParams();
  if (state.status) qs.set("status", state.status);
  if (state.search) qs.set("search", state.search);
  if (state.page > 1) qs.set("page", String(state.page));
  const s = qs.toString();
  return s ? `?${s}` : "";
}
