import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import {
  bearer,
  createSubmissionRecord,
  createUser,
  resetDb,
} from "./helpers.js";

describe("mentor API", () => {
  let mentor: Awaited<ReturnType<typeof createUser>>;
  let student: Awaited<ReturnType<typeof createUser>>;

  beforeEach(async () => {
    await resetDb();
    mentor = await createUser("MENTOR");
    student = await createUser("STUDENT", { name: "Alice Rahman" });
  });

  const get = (path: string) =>
    request(app).get(path).set(bearer(mentor.token));
  const review = (id: string, body: object) =>
    request(app)
      .patch(`/api/mentor/submissions/${id}/review`)
      .set(bearer(mentor.token))
      .send(body);

  it("returns counts by status", async () => {
    await createSubmissionRecord(student.user.id);
    await createSubmissionRecord(student.user.id);
    await createSubmissionRecord(student.user.id, { status: "APPROVED" });
    await createSubmissionRecord(student.user.id, { status: "REJECTED" });

    const res = await get("/api/mentor/stats");

    expect(res.status).toBe(200);
    expect(res.body.data.stats).toEqual({
      total: 4,
      pending: 2,
      approved: 1,
      rejected: 1,
    });
  });

  describe("listing", () => {
    it("paginates on the server, newest first, with meta", async () => {
      const ids: string[] = [];
      for (let i = 1; i <= 5; i++) {
        const s = await createSubmissionRecord(student.user.id, {
          createdAt: new Date(2026, 0, i),
        });
        ids.push(s.id);
      }

      const first = await get("/api/mentor/submissions?page=1&limit=2");
      expect(first.status).toBe(200);
      expect(
        first.body.data.submissions.map((s: { id: string }) => s.id),
      ).toEqual([ids[4], ids[3]]);
      expect(first.body.meta).toEqual({
        page: 1,
        limit: 2,
        total: 5,
        totalPages: 3,
      });

      const last = await get("/api/mentor/submissions?page=3&limit=2");
      expect(last.body.data.submissions).toHaveLength(1);
    });

    it("rejects a page size above the maximum", async () => {
      const res = await get("/api/mentor/submissions?limit=500");
      expect(res.status).toBe(400);
    });

    it("filters by status", async () => {
      await createSubmissionRecord(student.user.id);
      await createSubmissionRecord(student.user.id);
      await createSubmissionRecord(student.user.id, { status: "APPROVED" });

      const res = await get("/api/mentor/submissions?status=APPROVED");

      expect(res.body.data.submissions).toHaveLength(1);
      expect(res.body.data.submissions[0].status).toBe("APPROVED");
      expect(res.body.meta.total).toBe(1);
    });

    it("rejects an unknown status", async () => {
      const res = await get("/api/mentor/submissions?status=DONE");
      expect(res.status).toBe(400);
    });

    it("searches project and student names, ignoring case", async () => {
      const bob = await createUser("STUDENT", { name: "Bob Hasan" });
      await createSubmissionRecord(student.user.id, {
        projectName: "Portfolio",
      });
      await createSubmissionRecord(bob.user.id, { projectName: "RoboSim" });

      const byProject = await get("/api/mentor/submissions?search=ROBO");
      expect(
        byProject.body.data.submissions.map(
          (s: { projectName: string }) => s.projectName,
        ),
      ).toEqual(["RoboSim"]);

      const byStudent = await get("/api/mentor/submissions?search=alice");
      expect(
        byStudent.body.data.submissions.map(
          (s: { projectName: string }) => s.projectName,
        ),
      ).toEqual(["Portfolio"]);
    });
  });

  describe("review", () => {
    it("approves a submission and records who reviewed it and when", async () => {
      const s = await createSubmissionRecord(student.user.id);
      const res = await review(s.id, { status: "APPROVED" });

      expect(res.status).toBe(200);
      expect(res.body.data.submission.status).toBe("APPROVED");

      const saved = await prisma.submission.findUniqueOrThrow({
        where: { id: s.id },
      });
      expect(saved.reviewerId).toBe(mentor.user.id);
      expect(saved.reviewedAt).not.toBeNull();
    });

    it("requires feedback when rejecting", async () => {
      const s = await createSubmissionRecord(student.user.id);
      const res = await review(s.id, { status: "REJECTED" });

      expect(res.status).toBe(400);
      expect(res.body.errors.map((e: { field: string }) => e.field)).toContain(
        "feedback",
      );
    });

    it("rejects with feedback and saves it", async () => {
      const s = await createSubmissionRecord(student.user.id);
      const res = await review(s.id, {
        status: "REJECTED",
        feedback: "Add a README with setup steps.",
      });

      expect(res.status).toBe(200);
      expect(res.body.data.submission).toMatchObject({
        status: "REJECTED",
        feedback: "Add a README with setup steps.",
      });
    });

    it("does not allow a second review of the same submission", async () => {
      const s = await createSubmissionRecord(student.user.id);
      await review(s.id, { status: "APPROVED" });
      const res = await review(s.id, {
        status: "REJECTED",
        feedback: "Changed my mind about this.",
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Submission has already been approved");
    });

    it("returns 404 for an unknown submission", async () => {
      const res = await review("doesnotexist", { status: "APPROVED" });
      expect(res.status).toBe(404);
    });

    it("rejects a status other than APPROVED or REJECTED", async () => {
      const s = await createSubmissionRecord(student.user.id);
      const res = await review(s.id, { status: "PENDING" });
      expect(res.status).toBe(400);
    });
  });
});
