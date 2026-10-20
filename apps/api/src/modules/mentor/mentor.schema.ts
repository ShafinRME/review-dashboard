import { z } from "zod";

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  search: z.string().trim().max(100).optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1).max(50),
});

export const reviewSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"], {
      error: "Status must be APPROVED or REJECTED",
    }),
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

export type ListQuery = z.infer<typeof listQuerySchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
