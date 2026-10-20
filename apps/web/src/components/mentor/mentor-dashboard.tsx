import { Suspense } from "react";
import { StatsOverview } from "@/components/mentor/stats-overview";
import { SubmissionsPanel } from "@/components/mentor/submissions-panel";
import { Skeleton } from "@/components/ui/skeleton";

export function MentorDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Review queue</h1>
        <p className="mt-1 text-muted-foreground">
          Approve or reject student projects.
        </p>
      </div>
      <StatsOverview />
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <SubmissionsPanel />
      </Suspense>
    </div>
  );
}
