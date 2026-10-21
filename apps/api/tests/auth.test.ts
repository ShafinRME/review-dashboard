import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { bearer, createUser, resetDb } from "./helpers.js";

describe("auth", () => {
  beforeEach(resetDb);

  describe("POST /api/auth/signup", () => {
    it("creates a student, normalizes the email and never returns the password hash", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Test Student",
          email: "  Test@Example.com ",
          password: "Secret123",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user).toMatchObject({
        email: "test@example.com",
        role: "STUDENT",
      });
      expect(res.body.data.token).toEqual(expect.any(String));
      expect(JSON.stringify(res.body)).not.toContain("passwordHash");
    });

    it("ignores a role sent in the request body", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Sneaky User",
          email: "sneaky@example.com",
          password: "Secret123",
          role: "MENTOR",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe("STUDENT");
    });

    it("rejects a duplicate email with 409", async () => {
      await createUser("STUDENT", { email: "taken@example.com" });
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Another One",
          email: "TAKEN@example.com",
          password: "Secret123",
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe(
        "An account with this email already exists",
      );
    });

    it("returns field-level errors for invalid input", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ name: "T", email: "bad", password: "weak" });

      expect(res.status).toBe(400);
      const fields = res.body.errors.map((e: { field: string }) => e.field);
      expect(fields).toEqual(
        expect.arrayContaining(["name", "email", "password"]),
      );
    });
  });

  describe("POST /api/auth/login", () => {
    it("returns a token for correct credentials", async () => {
      const { user, password } = await createUser("STUDENT");
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: user.email, password });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toEqual(expect.any(String));
      expect(res.body.data.user.id).toBe(user.id);
    });

    it("gives the same 401 message for a wrong password and an unknown email", async () => {
      const { user } = await createUser("STUDENT");
      const wrongPassword = await request(app)
        .post("/api/auth/login")
        .send({ email: user.email, password: "Wrong123" });
      const unknownEmail = await request(app)
        .post("/api/auth/login")
        .send({ email: "nobody@example.com", password: "Secret123" });

      expect(wrongPassword.status).toBe(401);
      expect(unknownEmail.status).toBe(401);
      expect(wrongPassword.body.message).toBe(unknownEmail.body.message);
    });
  });

  describe("GET /api/auth/me", () => {
    it("rejects a missing Authorization header", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
      expect(res.body.message).toBe(
        "Missing or malformed Authorization header",
      );
    });

    it("rejects a malformed token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set(bearer("not-a-real-token"));
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid token");
    });

    it("rejects a token signed with a different secret", async () => {
      const { user } = await createUser("STUDENT");
      const forged = jwt.sign(
        { sub: user.id, role: "MENTOR" },
        "a-completely-different-secret-value-123456",
      );
      const res = await request(app).get("/api/auth/me").set(bearer(forged));
      expect(res.status).toBe(401);
    });

    it("rejects an expired token", async () => {
      const { user } = await createUser("STUDENT");
      const expired = jwt.sign(
        { sub: user.id, role: "STUDENT" },
        process.env.JWT_ACCESS_SECRET as string,
        {
          expiresIn: -10,
        },
      );
      const res = await request(app).get("/api/auth/me").set(bearer(expired));
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Token expired");
    });

    it("returns the current user for a valid token", async () => {
      const { user, token } = await createUser("STUDENT");
      const res = await request(app).get("/api/auth/me").set(bearer(token));
      expect(res.status).toBe(200);
      expect(res.body.data.user).toMatchObject({
        id: user.id,
        email: user.email,
        role: "STUDENT",
      });
    });
  });
});
