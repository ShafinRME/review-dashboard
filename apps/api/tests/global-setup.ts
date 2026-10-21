import "dotenv/config";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// Runs once before all tests: checks the database is a test database, then applies migrations.
export default function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error(
      "TEST_DATABASE_URL is not set. Add it to apps/api/.env (see .env.example).",
    );
  }

  const dbName = new URL(url).pathname.replace("/", "");
  if (!/test/i.test(dbName)) {
    throw new Error(
      `Refusing to run: database "${dbName}" does not look like a test database.`,
    );
  }

  execSync("pnpm exec prisma migrate deploy", {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    env: { ...process.env, DATABASE_URL: url },
    stdio: "inherit",
  });
}
