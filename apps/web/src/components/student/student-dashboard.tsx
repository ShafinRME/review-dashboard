"use client";

import { StatusBadge } from "@/components/status-badge";
import { useMySubmissions } from "@/hooks/use-submissions";

export function StudentDashboard() {
  const { data, isPending, isError, error } = useMySubmissions();

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">
        Your submissions
      </h1>

      {isPending && <p className="mt-4 text-muted-foreground">Loading...</p>}
      {isError && <p className="mt-4 text-destructive">{error.message}</p>}
      {data && data.length === 0 && (
        <p className="mt-4 text-muted-foreground">No submissions yet.</p>
      )}
      {data && data.length > 0 && (
        <ul className="mt-4 space-y-2">
          {data.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <span className="font-medium">{s.projectName}</span>
              <StatusBadge status={s.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
