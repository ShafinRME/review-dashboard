import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import {
  API_URL,
  TOKEN_COOKIE,
  TOKEN_MAX_AGE_SECONDS,
} from "@/lib/server/constants";

type RouteContext = { params: Promise<{ path: string[] }> };

type UpstreamBody = {
  success: boolean;
  data?: Record<string, unknown> | null;
  message?: string;
};

async function handler(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  const route = path.join("/");
  const cookieStore = await cookies();

  if (route === "auth/logout" && req.method === "POST") {
    cookieStore.delete(TOKEN_COOKIE);
    return NextResponse.json({ success: true, data: null });
  }

  const sessionToken = cookieStore.get(TOKEN_COOKIE)?.value;
  const headers: Record<string, string> = {};
  const contentType = req.headers.get("content-type");
  if (contentType) headers["content-type"] = contentType;
  if (sessionToken) headers.authorization = `Bearer ${sessionToken}`;

  const hasBody = req.method !== "GET" && req.method !== "HEAD";

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/${route}${req.nextUrl.search}`, {
      method: req.method,
      headers,
      body: hasBody ? await req.text() : undefined,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "The API is unreachable. Please try again in a moment.",
      },
      { status: 502 },
    );
  }

  let body: UpstreamBody;
  try {
    body = JSON.parse(await upstream.text()) as UpstreamBody;
  } catch {
    return NextResponse.json(
      { success: false, message: "Unexpected response from the API." },
      { status: 502 },
    );
  }

  const isAuthRequest =
    req.method === "POST" &&
    (route === "auth/login" || route === "auth/signup");
  const newToken =
    typeof body.data?.token === "string" ? body.data.token : null;

  if (isAuthRequest && upstream.ok && newToken) {
    cookieStore.set(TOKEN_COOKIE, newToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: TOKEN_MAX_AGE_SECONDS,
    });
    // The token stays server-side; the browser only receives the user.
    delete body.data!.token;
  }

  // Expired or invalid session: clear the stale cookie.
  if (upstream.status === 401 && sessionToken) cookieStore.delete(TOKEN_COOKIE);

  return NextResponse.json(body, { status: upstream.status });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
