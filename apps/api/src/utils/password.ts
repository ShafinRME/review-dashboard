import bcrypt from "bcryptjs";
import { env } from "../env.js";

// Production uses a strong cost. Tests use the minimum so the suite stays fast.
const SALT_ROUNDS = env.NODE_ENV === "test" ? 4 : 12;

export const hashPassword = (plain: string) => bcrypt.hash(plain, SALT_ROUNDS);

export const verifyPassword = (plain: string, hash: string) =>
  bcrypt.compare(plain, hash);
