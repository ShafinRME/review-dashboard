import { z } from "zod";

// Keep these rules in sync with apps/api/src/modules/submissions/submission.schema.ts
const GITHUB_REPO =
  /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+?(?:\.git)?\/?$/i;

const isHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

export const createSubmissionSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name must be at most 100 characters"),
  repoUrl: z
    .string()
    .trim()
    .max(200, "Repository URL is too long")
    .regex(
      GITHUB_REPO,
      "Enter a valid GitHub repository URL (https://github.com/owner/repo)",
    ),
  liveUrl: z
    .string()
    .trim()
    .max(300, "Live link is too long")
    .refine(isHttpsUrl, "Live link must be a valid https:// URL"),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must be at most 1000 characters"),
});

export type SubmissionValues = z.infer<typeof createSubmissionSchema>;
