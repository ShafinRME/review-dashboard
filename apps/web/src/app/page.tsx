import Link from "next/link";
import { redirect } from "next/navigation";
import { homeFor } from "@/lib/roles";
import { getCurrentUser } from "@/lib/server/session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user.role));
  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Project Review Dashboard</CardTitle>
          <CardDescription>
            Students submit projects. Mentors review them.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/signup">Sign up</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
