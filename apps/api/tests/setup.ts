import "dotenv/config";
import { afterAll } from "vitest";

// Runs in every test file BEFORE the app is imported, so src/env.ts reads these values.
const testDbUrl = process.env.TEST_DATABASE_URL;
if (!testDbUrl) throw new Error("TEST_DATABASE_URL is not set.");
if (!/test/i.test(new URL(testDbUrl).pathname)) {
  throw new Error(
    "TEST_DATABASE_URL must point to a database whose name contains 'test'.",
  );
}

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = testDbUrl;
process.env.CORS_ORIGIN = "http://localhost:3000";
process.env.JWT_ACCESS_SECRET =
  "test-secret-that-is-at-least-32-characters-long";
process.env.JWT_ACCESS_EXPIRES_IN = "1h";
process.env.SUBMISSION_RATE_LIMIT_MAX = "1000";

afterAll(async () => {
  const { prisma } = await import("../src/lib/prisma.js");
  await prisma.$disconnect();
});
