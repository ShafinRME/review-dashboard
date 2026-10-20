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

export async function createSubmission(
  studentId: string,
  input: CreateSubmissionInput,
) {
  const duplicate = await prisma.submission.findFirst({
    where: { repoUrl: input.repoUrl },
    select: { studentId: true },
  });

  if (duplicate) {
    throw ApiError.conflict(
      duplicate.studentId === studentId
        ? "You have already submitted this repository"
        : "This repository has already been submitted",
    );
  }

  // A concurrent duplicate hits the DB unique constraint; errorHandler maps P2002 to 409.
  return prisma.submission.create({
    data: { ...input, studentId },
    select: submissionSelect,
  });
}

export function listMySubmissions(studentId: string) {
  return prisma.submission.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    select: submissionSelect,
  });
}
