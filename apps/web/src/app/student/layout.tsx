import { ProtectedShell } from "@/components/auth/protected-shell";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedShell role="STUDENT">{children}</ProtectedShell>;
}
