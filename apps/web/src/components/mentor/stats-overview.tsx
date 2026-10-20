"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMentorStats } from "@/hooks/use-mentor";

const segments = [
  { key: "pending", label: "Pending", color: "bg-[#e8a93a]" },
  { key: "approved", label: "Approved", color: "bg-[#1f9d6b]" },
  { key: "rejected", label: "Rejected", color: "bg-[#d14343]" },
] as const;

function StatsSkeleton() {
  return (
    <Card className="p-6" aria-busy="true" aria-label="Loading statistics">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-20" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-12 w-full sm:w-72" />
      </div>
      <Skeleton className="mt-6 h-3 w-full rounded-full" />
    </Card>
  );
}

export function StatsOverview() {
  const {
    data: stats,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
  } = useMentorStats();

  if (isPending) return <StatsSkeleton />;

  if (isError) {
    return (
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
    );
  }

  const { total, pending, approved, rejected } = stats;
  const percent = (n: number) => (total === 0 ? 0 : (n / total) * 100);

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Waiting for review</p>
          <p className="mt-1 text-5xl font-semibold tabular-nums tracking-tight">
            {pending}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {total === 0
              ? "No submissions yet."
              : pending === 0
                ? "Everything has been reviewed."
                : `of ${total} total submissions`}
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-6 text-sm">
          {[
            { label: "Approved", value: approved },
            { label: "Rejected", value: rejected },
            { label: "Total", value: total },
          ].map((item) => (
            <div key={item.label}>
              <dt className="text-muted-foreground">{item.label}</dt>
              <dd className="mt-0.5 text-xl font-semibold tabular-nums">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div
        role="img"
        aria-label={`${pending} pending, ${approved} approved, ${rejected} rejected out of ${total} submissions`}
        className="mt-6 flex h-3 w-full overflow-hidden rounded-full bg-muted"
      >
        {segments.map((segment) => (
          <div
            key={segment.key}
            className={segment.color}
            style={{ width: `${percent(stats[segment.key])}%` }}
          />
        ))}
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
        {segments.map((segment) => (
          <li key={segment.key} className="flex items-center gap-2">
            <span
              className={`size-2.5 rounded-full ${segment.color}`}
              aria-hidden="true"
            />
            {segment.label}
            <span className="font-medium tabular-nums text-foreground">
              {stats[segment.key]}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
