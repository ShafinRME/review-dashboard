import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { ListQuery, ReviewInput } from "./mentor.schema.js";

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
  student: { select: { id: true, name: true, email: true } },
} as const;

export async function listSubmissions({
  page,
  limit,
  status,
  search,
}: ListQuery) {
  const where: Prisma.SubmissionWhereInput = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { projectName: { contains: search, mode: "insensitive" } },
            { student: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.submission.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: submissionSelect,
    }),
    prisma.submission.count({ where }),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getStats() {
  const groups = await prisma.submission.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const count = (status: string) =>
    groups.find((g) => g.status === status)?._count._all ?? 0;
  const pending = count("PENDING");
  const approved = count("APPROVED");
  const rejected = count("REJECTED");

  return { total: pending + approved + rejected, pending, approved, rejected };
}

export async function reviewSubmission(
  id: string,
  reviewerId: string,
  input: ReviewInput,
) {
  // Atomic: only a still-PENDING row can be updated, so two mentors can't both review it.
  const result = await prisma.submission.updateMany({
    where: { id, status: "PENDING" },
    data: {
      status: input.status,
      feedback: input.feedback || null,
      reviewerId,
      reviewedAt: new Date(),
    },
  });

  if (result.count === 0) {
    const existing = await prisma.submission.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!existing) throw ApiError.notFound("Submission not found");
    throw ApiError.conflict(
      `Submission has already been ${existing.status.toLowerCase()}`,
    );
  }

  return prisma.submission.findUniqueOrThrow({
    where: { id },
    select: submissionSelect,
  });
}
