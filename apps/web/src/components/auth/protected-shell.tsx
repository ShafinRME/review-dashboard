import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { AuthProvider } from "@/components/auth/auth-provider";
import { homeFor } from "@/lib/roles";
import { getCurrentUser } from "@/lib/server/session";
import type { Role } from "@/types/api";

// Authoritative guard: Express confirms the user, then we check the role.
export async function ProtectedShell({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== role) redirect(homeFor(user.role));

  return (
    <AuthProvider user={user}>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </AuthProvider>
  );
}
