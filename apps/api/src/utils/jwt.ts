import jwt, { type SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { env } from "../env.js";

const payloadSchema = z.object({
  sub: z.string().min(1),
  role: z.enum(["STUDENT", "MENTOR"]),
});

export type AuthPayload = z.infer<typeof payloadSchema>;

export function signAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    algorithm: "HS256",
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AuthPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    algorithms: ["HS256"],
  });
  return payloadSchema.parse(decoded);
}
