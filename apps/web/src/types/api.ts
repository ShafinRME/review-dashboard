export type Role = "STUDENT" | "MENTOR";
export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Submission {
  id: string;
  projectName: string;
  repoUrl: string;
  liveUrl: string;
  description: string;
  status: SubmissionStatus;
  feedback: string | null;
  reviewedAt: string | null;
  createdAt: string;
  student?: { id: string; name: string; email: string };
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateSubmissionInput {
  projectName: string;
  repoUrl: string;
  liveUrl: string;
  description: string;
}

export interface ReviewInput {
  status: "APPROVED" | "REJECTED";
  feedback?: string;
}

export interface ListParams {
  page?: number;
  limit?: number;
  status?: SubmissionStatus;
  search?: string;
}
