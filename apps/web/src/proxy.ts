import { NextResponse, type NextRequest } from "next/server";
import { homeFor } from "@/lib/roles";
import { TOKEN_COOKIE } from "@/lib/server/constants";
import type { Role } from "@/types/api";

// Optimistic check only: decodes the payload WITHOUT verifying the signature.
// The real authority is Express (see getCurrentUser and the API middlewares).
function readSession(token: string | undefined): { role: Role } | null {
  if (!token) return null;
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const payload = JSON.parse(
      atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/")),
    ) as {
      exp?: unknown;
      role?: unknown;
    };
    if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now())
      return null;
    if (payload.role !== "STUDENT" && payload.role !== "MENTOR") return null;
    return { role: payload.role };
  } catch {
    return null;
  }
}

export function proxy(req: NextRequest) {
  const session = readSession(req.cookies.get(TOKEN_COOKIE)?.value);

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    const res = NextResponse.redirect(url);
    res.cookies.delete(TOKEN_COOKIE);
    return res;
  }

  const required: Role = req.nextUrl.pathname.startsWith("/mentor")
    ? "MENTOR"
    : "STUDENT";
  if (session.role !== required) {
    const url = req.nextUrl.clone();
    url.pathname = homeFor(session.role);
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/mentor/:path*"],
};
