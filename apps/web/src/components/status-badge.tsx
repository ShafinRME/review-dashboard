import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubmissionStatus } from "@/types/api";

const styles = {
  PENDING: {
    label: "Pending review",
    icon: Clock,
    className: "bg-[#fff4db] text-[#8a5a00]",
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-[#ddf5e8] text-[#0f6b45]",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-[#fde8e8] text-[#a12b2b]",
  },
} as const;

export function StatusBadge({
  status,
  className,
}: {
  status: SubmissionStatus;
  className?: string;
}) {
  const { label, icon: Icon, className: tone } = styles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
        tone,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
