import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import type { Submission } from "@/types/api";

const linkClass =
  "rounded-sm underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SubmissionsTable({
  submissions,
  actions,
}: {
  submissions: Submission[];
  actions?: (submission: Submission) => React.ReactNode;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Student</TableHead>
          <TableHead className="hidden md:table-cell">Submitted</TableHead>
          <TableHead>Status</TableHead>
          {actions && <TableHead className="text-right">Action</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((s) => (
          <TableRow key={s.id}>
            <TableCell className="max-w-[16rem] whitespace-normal">
              <p className="truncate font-medium">{s.projectName}</p>
              <p className="mt-1 flex gap-3 text-xs text-muted-foreground">
                <a
                  href={s.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Repository
                  <span className="sr-only">
                    {" "}
                    for {s.projectName} (opens in a new tab)
                  </span>
                </a>
                <a
                  href={s.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Live site
                  <span className="sr-only">
                    {" "}
                    for {s.projectName} (opens in a new tab)
                  </span>
                </a>
              </p>
            </TableCell>
            <TableCell className="whitespace-normal">
              <p className="font-medium">{s.student?.name}</p>
              <p className="text-xs text-muted-foreground">
                {s.student?.email}
              </p>
            </TableCell>
            <TableCell className="hidden whitespace-nowrap text-muted-foreground md:table-cell">
              {formatDate(s.createdAt)}
            </TableCell>
            <TableCell>
              <StatusBadge status={s.status} />
            </TableCell>
            {actions && (
              <TableCell className="text-right">{actions(s)}</TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function SubmissionsTableSkeleton() {
  return (
    <Table aria-busy="true" aria-label="Loading submissions">
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Student</TableHead>
          <TableHead className="hidden md:table-cell">Submitted</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }, (_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-2 h-3 w-28" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-2 h-3 w-36" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-28 rounded-full" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
