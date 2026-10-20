import { ProtectedShell } from "@/components/auth/protected-shell";

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedShell role="MENTOR">{children}</ProtectedShell>;
}
