import type { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/prisma.js";
import { signAccessToken } from "../src/utils/jwt.js";
import { hashPassword } from "../src/utils/password.js";

export async function resetDb() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "submissions", "users" RESTART IDENTITY CASCADE',
  );
}

let counter = 0;

export async function createUser(
  role: "STUDENT" | "MENTOR" = "STUDENT",
  overrides: { name?: string; email?: string; password?: string } = {},
) {
  counter += 1;
  const password = overrides.password ?? "Secret123";
  const user = await prisma.user.create({
    data: {
      name: overrides.name ?? `${role} ${counter}`,
      email: overrides.email ?? `${role.toLowerCase()}${counter}@example.com`,
      passwordHash: await hashPassword(password),
      role,
    },
  });
  return {
    user,
    password,
    token: signAccessToken({ sub: user.id, role: user.role }),
  };
}

export function createSubmissionRecord(
  studentId: string,
  overrides: Partial<Prisma.SubmissionUncheckedCreateInput> = {},
) {
  counter += 1;
  return prisma.submission.create({
    data: {
      projectName: `Project ${counter}`,
      repoUrl: `https://github.com/test-user/project-${counter}`,
      liveUrl: "https://project.example.com",
      description:
        "A demo project used in tests, long enough to pass validation.",
      studentId,
      ...overrides,
    },
  });
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

export const validSubmission = (overrides: Record<string, string> = {}) => ({
  projectName: "Portfolio Website",
  repoUrl: "https://github.com/test-user/portfolio",
  liveUrl: "https://portfolio.example.com",
  description: "A personal portfolio built with Next.js and Tailwind.",
  ...overrides,
});
