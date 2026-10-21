import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { CreateSubmissionInput } from "./submission.schema.js";

const submissionSelect = {
  id: true,
  projectName: true,
  repoUrl: true,
  liveUrl: true,
  description: true,
  status: true,
  feedback: true,
  reviewedAt: true,
  createdAt: true,
} as const;

export async function createSubmission(studentId: string, input: CreateSubmissionInput) {
  const existing = await prisma.submission.findFirst({
    where: { repoUrl: input.repoUrl },
    select: { id: true, studentId: true, status: true },
  });

  if (!existing) {
    // A concurrent duplicate hits the DB unique constraint; errorHandler maps P2002 to 409.
    const submission = await prisma.submission.create({
      data: { ...input, studentId },
      select: submissionSelect,
    });
    return { submission, resubmitted: false };
  }

  if (existing.studentId !== studentId) throw ApiError.conflict("This repository has already been submitted");
  if (existing.status === "PENDING") throw ApiError.conflict("This repository is already waiting for review");
  if (existing.status === "APPROVED") throw ApiError.conflict("This repository has already been approved");

  // REJECTED: the student fixed the project and submits it again. Start a fresh review cycle.
  // The status guard makes this atomic, so two simultaneous requests cannot both reopen it.
  const reopened = await prisma.submission.updateMany({
    where: { id: existing.id, studentId, status: "REJECTED" },
    data: {
      projectName: input.projectName,
      liveUrl: input.liveUrl,
      description: input.description,
      status: "PENDING",
      feedback: null,
      reviewedAt: null,
      reviewerId: null,
      createdAt: new Date(),
    },
  });
  if (reopened.count === 0) throw ApiError.conflict("This submission can no longer be resubmitted");

  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: existing.id },
    select: submissionSelect,
  });
  return { submission, resubmitted: true };
}

export function listMySubmissions(studentId: string) {
  return prisma.submission.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    select: submissionSelect,
  });
}