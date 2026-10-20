import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mentor" };

export default function MentorPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">Mentor dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        The review table arrives on Day 3.
      </p>
    </section>
  );
}
