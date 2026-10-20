import type { Metadata } from "next";

export const metadata: Metadata = { title: "Student" };

export default function StudentPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">Student dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        The submission form arrives on Day 3.
      </p>
    </section>
  );
}
