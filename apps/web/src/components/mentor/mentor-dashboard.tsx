import { StatsOverview } from "@/components/mentor/stats-overview";

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
    </div>
  );
}
