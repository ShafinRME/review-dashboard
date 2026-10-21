import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

// The limit is read when the app is imported, so set it first and import dynamically.
process.env.SUBMISSION_RATE_LIMIT_MAX = "3";
const { app } = await import("../src/app.js");
const { bearer, createUser, resetDb, validSubmission } =
  await import("./helpers.js");

describe("submission rate limit", () => {
  beforeEach(resetDb);

  const submit = (token: string, n: number) =>
    request(app)
      .post("/api/submissions")
      .set(bearer(token))
      .send(
        validSubmission({ repoUrl: `https://github.com/test-user/repo-${n}` }),
      );

  it("blocks requests after the limit is reached", async () => {
    const { token } = await createUser("STUDENT");

    for (let n = 1; n <= 3; n++) {
      const res = await submit(token, n);
      expect(res.status).toBe(201);
    }

    const blocked = await submit(token, 4);
    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toBe(
      "Too many submissions. Please try again later.",
    );
  });

  it("counts each user separately", async () => {
    const first = await createUser("STUDENT");
    const second = await createUser("STUDENT");

    for (let n = 1; n <= 3; n++) await submit(first.token, n);

    const res = await submit(second.token, 10);
    expect(res.status).toBe(201);
  });
});
