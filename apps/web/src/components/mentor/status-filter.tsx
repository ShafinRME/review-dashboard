import { Button } from "@/components/ui/button";
import type { Stats, SubmissionStatus } from "@/types/api";

type Value = SubmissionStatus | undefined;

const options: { value: Value; label: string; count: (s: Stats) => number }[] =
  [
    { value: undefined, label: "All", count: (s) => s.total },
    { value: "PENDING", label: "Pending", count: (s) => s.pending },
    { value: "APPROVED", label: "Approved", count: (s) => s.approved },
    { value: "REJECTED", label: "Rejected", count: (s) => s.rejected },
  ];

export function StatusFilter({
  value,
  onChange,
  stats,
}: {
  value: Value;
  onChange: (value: Value) => void;
  stats?: Stats;
}) {
  return (
    <div
      role="group"
      aria-label="Filter by status"
      className="flex flex-wrap gap-2"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Button
            key={option.label}
            type="button"
            size="sm"
            variant={active ? "default" : "outline"}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
          >
            {option.label}
            {stats && (
              <span className="tabular-nums opacity-70">
                {option.count(stats)}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
