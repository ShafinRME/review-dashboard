import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import {
  bearer,
  createSubmissionRecord,
  createUser,
  resetDb,
  validSubmission,
} from "./helpers.js";

describe("student submissions", () => {
  let student: Awaited<ReturnType<typeof createUser>>;

  beforeEach(async () => {
    await resetDb();
    student = await createUser("STUDENT");
  });

  const post = (token: string, body: object) =>
    request(app).post("/api/submissions").set(bearer(token)).send(body);

  it("creates a pending submission and normalizes the repository URL", async () => {
    const res = await post(
      student.token,
      validSubmission({
        repoUrl: "https://github.com/Test-User/Portfolio.git/",
      }),
    );

    expect(res.status).toBe(201);
    expect(res.body.data.resubmitted).toBe(false);
    expect(res.body.data.submission).toMatchObject({
      status: "PENDING",
      repoUrl: "https://github.com/test-user/portfolio",
    });
  });

  const invalidCases: [string, Record<string, string>, string][] = [
    [
      "a non-GitHub repository",
      { repoUrl: "https://gitlab.com/x/y" },
      "repoUrl",
    ],
    [
      "an insecure live link",
      { liveUrl: "http://insecure.example.com" },
      "liveUrl",
    ],
    ["a short description", { description: "too short" }, "description"],
    ["a short project name", { projectName: "ab" }, "projectName"],
  ];

  it.each(invalidCases)("rejects %s", async (_label, patch, field) => {
    const res = await post(student.token, validSubmission(patch));

    expect(res.status).toBe(400);
    expect(res.body.errors.map((e: { field: string }) => e.field)).toContain(
      field,
    );
  });

  describe("duplicate prevention", () => {
    it("blocks the same repository while it is waiting for review", async () => {
      await post(student.token, validSubmission());
      const res = await post(student.token, validSubmission());

      expect(res.status).toBe(409);
      expect(res.body.message).toBe(
        "This repository is already waiting for review",
      );
    });

    it("treats differently written URLs of the same repository as duplicates", async () => {
      await post(student.token, validSubmission());
      const res = await post(
        student.token,
        validSubmission({
          repoUrl: "https://github.com/TEST-USER/Portfolio.git",
        }),
      );

      expect(res.status).toBe(409);
    });

    it("blocks a repository that another student already submitted", async () => {
      const other = await createUser("STUDENT");
      await post(student.token, validSubmission());
      const res = await post(other.token, validSubmission());

      expect(res.status).toBe(409);
      expect(res.body.message).toBe(
        "This repository has already been submitted",
      );
    });
  });

  it("lists only the student's own submissions, newest first", async () => {
    const other = await createUser("STUDENT");
    const older = await createSubmissionRecord(student.user.id, {
      createdAt: new Date("2026-01-01"),
    });
    const newer = await createSubmissionRecord(student.user.id, {
      createdAt: new Date("2026-02-01"),
    });
    await createSubmissionRecord(other.user.id);

    const res = await request(app)
      .get("/api/submissions/mine")
      .set(bearer(student.token));

    expect(res.status).toBe(200);
    expect(res.body.data.submissions.map((s: { id: string }) => s.id)).toEqual([
      newer.id,
      older.id,
    ]);
  });

  describe("resubmission", () => {
    async function createAndReview(decision: "APPROVED" | "REJECTED") {
      const mentor = await createUser("MENTOR");
      const created = await post(student.token, validSubmission());
      const { id, createdAt } = created.body.data.submission as {
        id: string;
        createdAt: string;
      };

      const body =
        decision === "REJECTED"
          ? { status: decision, feedback: "Add a README with setup steps." }
          : { status: decision };
      const review = await request(app)
        .patch(`/api/mentor/submissions/${id}/review`)
        .set(bearer(mentor.token))
        .send(body);
      expect(review.status).toBe(200);

      return { id, createdAt };
    }

    it("reopens a rejected submission with the new details", async () => {
      const { id, createdAt } = await createAndReview("REJECTED");

      const res = await post(
        student.token,
        validSubmission({
          projectName: "Portfolio v2",
          description: "Now with a README, screenshots and setup steps.",
        }),
      );

      expect(res.status).toBe(200);
      expect(res.body.data.resubmitted).toBe(true);
      expect(res.body.data.submission).toMatchObject({
        id,
        projectName: "Portfolio v2",
        status: "PENDING",
        feedback: null,
        reviewedAt: null,
      });
      expect(
        new Date(res.body.data.submission.createdAt).getTime(),
      ).toBeGreaterThan(new Date(createdAt).getTime());
      expect(
        await prisma.submission.count({
          where: { studentId: student.user.id },
        }),
      ).toBe(1);
    });

    it("does not allow resubmitting an approved submission", async () => {
      await createAndReview("APPROVED");
      const res = await post(student.token, validSubmission());

      expect(res.status).toBe(409);
      expect(res.body.message).toBe(
        "This repository has already been approved",
      );
    });
  });
});
