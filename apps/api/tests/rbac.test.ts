import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { bearer, createUser, resetDb } from "./helpers.js";

type Method = "get" | "post" | "patch";

describe("role-based access control", () => {
  let student: Awaited<ReturnType<typeof createUser>>;
  let mentor: Awaited<ReturnType<typeof createUser>>;

  beforeEach(async () => {
    await resetDb();
    student = await createUser("STUDENT");
    mentor = await createUser("MENTOR");
  });

  const mentorRoutes: [Method, string][] = [
    ["get", "/api/mentor/stats"],
    ["get", "/api/mentor/submissions"],
    ["patch", "/api/mentor/submissions/some-id/review"],
  ];

  const studentRoutes: [Method, string][] = [
    ["post", "/api/submissions"],
    ["get", "/api/submissions/mine"],
  ];

  it.each(mentorRoutes)("%s %s requires a token", async (method, path) => {
    const res = await request(app)[method](path);
    expect(res.status).toBe(401);
  });

  it.each(mentorRoutes)(
    "%s %s is forbidden for a student",
    async (method, path) => {
      const res = await request(app)[method](path).set(bearer(student.token));
      expect(res.status).toBe(403);
      expect(res.body.message).toBe(
        "You do not have permission to perform this action",
      );
    },
  );

  it.each(studentRoutes)("%s %s requires a token", async (method, path) => {
    const res = await request(app)[method](path);
    expect(res.status).toBe(401);
  });

  it.each(studentRoutes)(
    "%s %s is forbidden for a mentor",
    async (method, path) => {
      const res = await request(app)[method](path).set(bearer(mentor.token));
      expect(res.status).toBe(403);
    },
  );

  it("lets a mentor read the stats", async () => {
    const res = await request(app)
      .get("/api/mentor/stats")
      .set(bearer(mentor.token));
    expect(res.status).toBe(200);
  });
});
