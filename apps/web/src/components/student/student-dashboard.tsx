import { SubmissionForm } from "@/components/student/submission-form";
import { SubmissionsList } from "@/components/student/submissions-list";

export function StudentDashboard() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start">
      <h1 className="sr-only">Student dashboard</h1>
      <SubmissionForm />
      <SubmissionsList />
    </div>
  );
}
