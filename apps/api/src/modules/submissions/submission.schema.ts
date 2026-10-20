import { z } from "zod";

const GITHUB_REPO =
  /^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/i;

const repoUrl = z
  .string()
  .trim()
  .max(200, "Repository URL is too long")
  .regex(
    GITHUB_REPO,
    "Enter a valid GitHub repository URL (https://github.com/owner/repo)",
  )
  .transform((value) => {
    const match = value.match(GITHUB_REPO);
    return `https://github.com/${match?.[1]}/${match?.[2]}`.toLowerCase();
  });

const liveUrl = z
  .string()
  .trim()
  .max(300, "Live link is too long")
  .refine((value) => {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "Live link must be a valid https:// URL");

export const createSubmissionSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name must be at most 100 characters"),
  repoUrl,
  liveUrl,
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must be at most 1000 characters"),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
