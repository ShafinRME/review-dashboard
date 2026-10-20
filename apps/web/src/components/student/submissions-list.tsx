"use client";

import { Inbox } from "lucide-react";
import { SubmissionCard } from "@/components/student/submission-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMySubmissions } from "@/hooks/use-submissions";

function ListSkeleton() {
  return (
    <ul
      className="mt-4 space-y-3"
      aria-busy="true"
      aria-label="Loading your submissions"
    >
      {[0, 1, 2].map((i) => (
        <li key={i} className="rounded-xl border p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </li>
      ))}
    </ul>
  );
}

export function SubmissionsList() {
  const { data, isPending, isError, error, refetch, isRefetching } =
    useMySubmissions();

  return (
    <section aria-labelledby="my-submissions">
      <h2 id="my-submissions" className="text-lg font-semibold tracking-tight">
        Your submissions
        {data && (
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {data.length}
          </span>
        )}
      </h2>

      {isPending && <ListSkeleton />}

      {isError && (
        <Alert variant="destructive" className="mt-4">
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

      {data && data.length === 0 && (
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed px-6 py-12 text-center">
          <Inbox className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-medium">No projects yet</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Submit your first project with the form. Its review status will show
            up here.
          </p>
        </div>
      )}

      {data && data.length > 0 && (
        <ul className="mt-4 space-y-3">
          {data.map((submission) => (
            <SubmissionCard key={submission.id} submission={submission} />
          ))}
        </ul>
      )}
    </section>
  );
}
