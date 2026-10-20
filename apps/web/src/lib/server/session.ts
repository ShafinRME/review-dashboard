import { cookies } from "next/headers";
import { cache } from "react";
import type { User } from "@/types/api";
import { API_URL, TOKEN_COOKIE } from "./constants";

// Asks Express who the cookie belongs to. Express verifies the JWT signature.
// `cache` de-duplicates the call within one request (layout + page).
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { user?: User } };
    return json.data?.user ?? null;
  } catch {
    return null;
  }
});
