import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginValues = z.infer<typeof loginSchema>;

// Keep these rules in sync with apps/api/src/modules/auth/auth.schema.ts
export const passwordRules = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (p: string) => p.length >= 8,
  },
  {
    id: "lower",
    label: "One lowercase letter",
    test: (p: string) => /[a-z]/.test(p),
  },
  {
    id: "upper",
    label: "One uppercase letter",
    test: (p: string) => /[A-Z]/.test(p),
  },
  { id: "number", label: "One number", test: (p: string) => /[0-9]/.test(p) },
] as const;

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be at most 80 characters"),
  email: z.email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Enter a password")
    .max(72, "Password must be at most 72 characters")
    .refine(
      (p) => passwordRules.every((rule) => rule.test(p)),
      "Password does not meet all the requirements",
    ),
});

export type SignupValues = z.infer<typeof signupSchema>;
