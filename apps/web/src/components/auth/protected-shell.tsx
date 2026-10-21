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
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <AppHeader />
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl px-4 py-8 outline-none"
      >
        {children}
      </main>
    </AuthProvider>
  );
}
