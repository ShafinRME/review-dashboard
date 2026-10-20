"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mentorKeys, useReviewSubmission } from "@/hooks/use-mentor";
import { ApiClientError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { reviewSchema } from "@/lib/validation/review";
import type { Submission } from "@/types/api";

type Decision = "APPROVED" | "REJECTED";

const linkClass =
  "rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ReviewDialog({
  submission,
  onClose,
}: {
  submission: Submission | null;
  onClose: () => void;
}) {
  const review = useReviewSubmission();
  const queryClient = useQueryClient();

  const [feedback, setFeedback] = useState("");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState<Decision | null>(null);
  const [stale, setStale] = useState(false);

  // Start fresh every time a different submission is opened (or the dialog closes).
  useEffect(() => {
    setFeedback("");
    setFeedbackError(null);
    setFormError(null);
    setPending(null);
    setStale(false);
  }, [submission]);

  async function decide(status: Decision) {
    if (!submission) return;
    setFormError(null);
    setFeedbackError(null);

    const parsed = reviewSchema.safeParse({
      status,
      feedback: feedback.trim() || undefined,
    });
    if (!parsed.success) {
      setFeedbackError(
        parsed.error.issues[0]?.message ?? "Check the feedback and try again.",
      );
      return;
    }

    setPending(status);
    try {
      await review.mutateAsync({ id: submission.id, input: parsed.data });
      toast.success(
        `${status === "APPROVED" ? "Approved" : "Rejected"} ${submission.projectName}`,
      );
      onClose();
    } catch (err) {
      setPending(null);
      if (err instanceof ApiClientError) {
        if (err.status === 401) return; // session expiry is handled globally
        if (err.status === 409 || err.status === 404) {
          setStale(true);
          setFormError(
            err.status === 409
              ? "Another mentor already reviewed this submission. The table has been refreshed."
              : "This submission no longer exists. The table has been refreshed.",
          );
          await queryClient.invalidateQueries({ queryKey: mentorKeys.all });
          return;
        }
        if (err.status === 400 && err.fieldErrors.length > 0) {
          setFeedbackError(err.fieldErrors[0]?.message ?? err.message);
          return;
        }
        setFormError(err.message);
        return;
      }
      toast.error("Something went wrong. Try again.");
    }
  }

  const busy = pending !== null;
  const readOnly = submission ? submission.status !== "PENDING" : false;

  return (
    <Dialog
      open={submission !== null}
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      {submission && (
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
          onInteractOutside={(e) => busy && e.preventDefault()}
          onEscapeKeyDown={(e) => busy && e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{submission.projectName}</DialogTitle>
            <DialogDescription>
              Submitted by {submission.student?.name} on{" "}
              {formatDate(submission.createdAt)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <p className="max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed text-muted-foreground">
              {submission.description}
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-1">
              <a
                href={submission.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Repository<span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a
                href={submission.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Live site<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>

            {readOnly ? (
              <div className="space-y-2 rounded-lg bg-muted p-3">
                <div className="flex items-center justify-between gap-3">
                  <StatusBadge status={submission.status} />
                  {submission.reviewedAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(submission.reviewedAt)}
                    </span>
                  )}
                </div>
                <p className="leading-relaxed">
                  {submission.feedback ?? "No written feedback."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  disabled={busy || stale}
                  aria-invalid={!!feedbackError}
                  aria-describedby="feedback-hint"
                  placeholder="What worked well, or what should the student fix?"
                />
                <p id="feedback-hint" className="text-xs text-muted-foreground">
                  Required when rejecting. Optional when approving.
                </p>
                {feedbackError && (
                  <p role="alert" className="text-sm text-destructive">
                    {feedbackError}
                  </p>
                )}
              </div>
            )}

            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            {readOnly || stale ? (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={onClose} disabled={busy}>
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => decide("REJECTED")}
                  disabled={busy}
                >
                  {pending === "REJECTED" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <XCircle className="size-4" />
                  )}
                  {pending === "REJECTED" ? "Rejecting" : "Reject"}
                </Button>
                <Button onClick={() => decide("APPROVED")} disabled={busy}>
                  {pending === "APPROVED" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  {pending === "APPROVED" ? "Approving" : "Approve"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
