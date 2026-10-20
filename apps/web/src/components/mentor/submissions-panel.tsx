"use client";

import { ChevronLeft, ChevronRight, SearchX, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ReviewDialog } from "@/components/mentor/review-dialog";
import { StatusFilter } from "@/components/mentor/status-filter";
import {
  SubmissionsTable,
  SubmissionsTableSkeleton,
} from "@/components/mentor/submissions-table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useMentorStats, useMentorSubmissions } from "@/hooks/use-mentor";
import {
  type ListState,
  PAGE_SIZE,
  parseListState,
  toSearchString,
} from "@/lib/list-params";
import { cn } from "@/lib/utils";
import type { Submission } from "@/types/api";

export function SubmissionsPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The URL is the single source of truth for status, search and page.
  const state = parseListState(searchParams);
  const [searchInput, setSearchInput] = useState(state.search);
  const [reviewing, setReviewing] = useState<Submission | null>(null);
  const debouncedSearch = useDebouncedValue(searchInput.trim());

  function update(patch: Partial<ListState>) {
    router.replace(`${pathname}${toSearchString({ ...state, ...patch })}`, {
      scroll: false,
    });
  }

  useEffect(() => {
    if (debouncedSearch !== state.search)
      update({ search: debouncedSearch, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data: stats } = useMentorStats();
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
    isPlaceholderData,
  } = useMentorSubmissions({
    page: state.page,
    limit: PAGE_SIZE,
    status: state.status,
    search: state.search || undefined,
  });

  // A link such as ?page=99 jumps to the last real page.
  useEffect(() => {
    if (data && !isPlaceholderData && state.page > data.meta.totalPages) {
      update({ page: data.meta.totalPages });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isPlaceholderData]);

  const filtered = Boolean(state.status || state.search);

  function clearFilters() {
    setSearchInput("");
    update({ status: undefined, search: "", page: 1 });
  }

  const meta = data?.meta;
  const from =
    meta && data.submissions.length > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
  const to = meta ? from + data.submissions.length - 1 : 0;

  return (
    <section aria-labelledby="submissions-heading" className="space-y-4">
      <h2
        id="submissions-heading"
        className="text-lg font-semibold tracking-tight"
      >
        Submissions
      </h2>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <StatusFilter
          value={state.status}
          onChange={(status) => update({ status, page: 1 })}
          stats={stats}
        />
        <div className="relative w-full lg:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            aria-label="Search by project or student name"
            placeholder="Search project or student"
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {isPending && (
        <div className="overflow-hidden rounded-xl border">
          <SubmissionsTableSkeleton />
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>{error.message}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              {isRefetching ? "Trying again" : "Try again"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {data && data.submissions.length === 0 && (
        <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-14 text-center">
          <SearchX
            className="size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="mt-3 font-medium">
            {filtered
              ? "No submissions match these filters"
              : "No submissions yet"}
          </p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {filtered
              ? "Try a different status or search term."
              : "Student projects will show up here once they are submitted."}
          </p>
          {filtered && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {data && data.submissions.length > 0 && (
        <>
          <div
            className={cn(
              "overflow-hidden rounded-xl border transition-opacity",
              isPlaceholderData && "opacity-60",
            )}
            aria-busy={isPlaceholderData}
          >
            <SubmissionsTable
              submissions={data.submissions}
              actions={(s) => (
                <Button
                  size="sm"
                  variant={s.status === "PENDING" ? "default" : "ghost"}
                  onClick={() => setReviewing(s)}
                  aria-label={`${s.status === "PENDING" ? "Review" : "View"} ${s.projectName}`}
                >
                  {s.status === "PENDING" ? "Review" : "View"}
                </Button>
              )}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-muted-foreground">
              Showing {from}–{to} of {meta?.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={state.page <= 1}
                onClick={() => update({ page: state.page - 1 })}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <span className="tabular-nums">
                Page {meta?.page} of {meta?.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!meta || state.page >= meta.totalPages}
                onClick={() => update({ page: state.page + 1 })}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      <ReviewDialog submission={reviewing} onClose={() => setReviewing(null)} />

      <p className="sr-only" aria-live="polite">
        {meta ? `${meta.total} submissions found` : ""}
      </p>
    </section>
  );
}
