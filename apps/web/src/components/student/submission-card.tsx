import { GitBranch, Globe } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, hostFromUrl } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Submission } from "@/types/api";

const feedbackTone = {
  APPROVED: "bg-[#ddf5e8]/70 text-[#0f4f35]",
  REJECTED: "bg-[#fde8e8]/80 text-[#7d2020]",
} as const;

function ExternalLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-w-0 items-center gap-1.5 rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="text-muted-foreground" aria-hidden="true">
        {icon}
      </span>
      <span className="truncate">{children}</span>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

export function SubmissionCard({ submission }: { submission: Submission }) {
  const repoPath = submission.repoUrl.replace(/^https:\/\/github\.com\//i, "");
  const reviewed = submission.status !== "PENDING";

  return (
    <li className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold tracking-tight">
            {submission.projectName}
          </h3>
          <p className="text-sm text-muted-foreground">
            Submitted {formatDate(submission.createdAt)}
          </p>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
        {submission.description}
      </p>

      <div className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-x-6">
        <ExternalLink
          href={submission.repoUrl}
          icon={<GitBranch className="size-4" />}
        >
          <span className="font-mono text-[13px]">{repoPath}</span>
        </ExternalLink>
        <ExternalLink
          href={submission.liveUrl}
          icon={<Globe className="size-4" />}
        >
          {hostFromUrl(submission.liveUrl)}
        </ExternalLink>
      </div>

      {reviewed && (
        <div
          className={cn(
            "mt-4 rounded-lg p-3 text-sm",
            feedbackTone[submission.status as "APPROVED" | "REJECTED"],
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium">Mentor feedback</p>
            {submission.reviewedAt && (
              <p className="text-xs opacity-80">
                {formatDate(submission.reviewedAt)}
              </p>
            )}
          </div>
          <p className="mt-1 leading-relaxed">
            {submission.feedback ?? "No written feedback."}
          </p>
          {submission.status === "REJECTED" && (
            <p className="mt-2 text-xs opacity-80">
              Fixed the issues? Submit the same repository again with updated
              details.
            </p>
          )}
        </div>
      )}
    </li>
  );
}
