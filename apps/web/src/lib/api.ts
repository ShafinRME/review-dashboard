import type {
  CreateSubmissionInput,
  FieldError,
  ListParams,
  LoginInput,
  PageMeta,
  ReviewInput,
  SignupInput,
  Stats,
  Submission,
  User,
} from "@/types/api";

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fieldErrors: FieldError[] = [],
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type Envelope<T> = {
  success: boolean;
  data?: T;
  meta?: PageMeta;
  message?: string;
  errors?: FieldError[];
};

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<{ data: T; meta?: PageMeta }> {
  let res: Response;
  try {
    res = await fetch(`/api/${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
      credentials: "same-origin",
    });
  } catch {
    throw new ApiClientError(
      0,
      "Network error. Check your connection and try again.",
    );
  }

  let json: Envelope<T>;
  try {
    json = (await res.json()) as Envelope<T>;
  } catch {
    throw new ApiClientError(res.status, "Unexpected server response.");
  }

  if (!res.ok || !json.success) {
    throw new ApiClientError(
      res.status,
      json.message ?? "Something went wrong.",
      json.errors ?? [],
    );
  }

  return { data: json.data as T, meta: json.meta };
}

const json = (body: unknown) => JSON.stringify(body);

function toQuery(params: ListParams) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") qs.set(key, String(value));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export const api = {
  auth: {
    login: async (input: LoginInput) =>
      (
        await request<{ user: User }>("auth/login", {
          method: "POST",
          body: json(input),
        })
      ).data,
    signup: async (input: SignupInput) =>
      (
        await request<{ user: User }>("auth/signup", {
          method: "POST",
          body: json(input),
        })
      ).data,
    logout: async () => {
      await request<null>("auth/logout", { method: "POST" });
    },
    me: async () => (await request<{ user: User }>("auth/me")).data,
  },
  submissions: {
    create: async (input: CreateSubmissionInput) =>
      (
        await request<{ submission: Submission }>("submissions", {
          method: "POST",
          body: json(input),
        })
      ).data,
    listMine: async () =>
      (await request<{ submissions: Submission[] }>("submissions/mine")).data,
  },
  mentor: {
    list: async (params: ListParams = {}) => {
      const { data, meta } = await request<{ submissions: Submission[] }>(
        `mentor/submissions${toQuery(params)}`,
      );
      return { submissions: data.submissions, meta: meta as PageMeta };
    },
    stats: async () =>
      (await request<{ stats: Stats }>("mentor/stats")).data.stats,
    review: async (id: string, input: ReviewInput) =>
      (
        await request<{ submission: Submission }>(
          `mentor/submissions/${encodeURIComponent(id)}/review`,
          {
            method: "PATCH",
            body: json(input),
          },
        )
      ).data,
  },
};
