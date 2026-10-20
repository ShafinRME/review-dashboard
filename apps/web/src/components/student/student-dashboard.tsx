"use client";

import { StatusBadge } from "@/components/status-badge";
import { SubmissionForm } from "@/components/student/submission-form";
import { useMySubmissions } from "@/hooks/use-submissions";

export function StudentDashboard() {
  const { data, isPending, isError, error } = useMySubmissions();

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start">
      <h1 className="sr-only">Student dashboard</h1>

      <SubmissionForm />

      <section aria-labelledby="my-submissions">
        <h2
          id="my-submissions"
          className="text-lg font-semibold tracking-tight"
        >
          Your submissions
        </h2>

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
                className="flex items-center justify-between gap-3 rounded-lg border p-4"
              >
                <span className="font-medium">{s.projectName}</span>
                <StatusBadge status={s.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
