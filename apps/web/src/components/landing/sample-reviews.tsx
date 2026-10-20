import { StatusBadge } from "@/components/status-badge";
import type { SubmissionStatus } from "@/types/api";

// Decorative sample of the review feed. Illustrative content only.
const samples: {
  project: string;
  student: string;
  status: SubmissionStatus;
  note?: string;
}[] = [
  { project: "Blood Book", student: "Nusrat J.", status: "APPROVED" },
  {
    project: "RoboSim",
    student: "Tanvir H.",
    status: "REJECTED",
    note: "Add a README with setup steps and this is ready to approve.",
  },
  { project: "DevCollab", student: "Rafi A.", status: "PENDING" },
];

export function SampleReviews() {
  return (
    <div aria-hidden="true" className="rounded-3xl bg-[#0d1230] p-5 sm:p-8">
      <div className="rounded-2xl bg-white p-5 text-[#0d1230] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]">
        <p className="font-semibold tracking-tight">Latest reviews</p>
        <ul className="mt-4 divide-y divide-[#e3e6ee]">
          {samples.map((s) => (
            <li key={s.project} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{s.project}</p>
                  <p className="text-sm text-[#5b6279]">{s.student}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
              {s.note && (
                <p className="mt-2 rounded-lg bg-[#fde8e8]/80 p-3 text-sm text-[#7d2020]">
                  {s.note}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
