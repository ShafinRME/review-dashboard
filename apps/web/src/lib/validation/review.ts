import { z } from "zod";

// Keep these rules in sync with apps/api/src/modules/mentor/mentor.schema.ts
export const reviewSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"]),
    feedback: z
      .string()
      .trim()
      .max(1000, "Feedback must be at most 1000 characters")
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.status === "REJECTED" && (value.feedback?.length ?? 0) < 5) {
      ctx.addIssue({
        code: "custom",
        path: ["feedback"],
        message: "Feedback (at least 5 characters) is required when rejecting",
      });
    }
  });
