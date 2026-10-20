import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { signAccessToken } from "../../utils/jwt.js";
import type { LoginInput, SignupInput } from "./auth.schema.js";

const publicUser = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

// Pre-computed hash so login takes similar time whether or not the email exists.
const DUMMY_HASH =
  "$2b$12$C6UzMDM.H6dfI/f/IKcEeO5nZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5.";

export async function signup(input: SignupInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing)
    throw ApiError.conflict("An account with this email already exists");

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: "STUDENT",
    },
    select: publicUser,
  });

  const token = signAccessToken({ sub: user.id, role: user.role });
  return { user, token };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  const valid = await verifyPassword(
    input.password,
    user?.passwordHash ?? DUMMY_HASH,
  );
  if (!user || !valid) throw ApiError.unauthorized("Invalid email or password");

  const token = signAccessToken({ sub: user.id, role: user.role });
  const { passwordHash: _omit, updatedAt: _u, ...safe } = user;
  return { user: safe, token };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUser,
  });
  if (!user) throw ApiError.unauthorized("Account no longer exists");
  return user;
}
