import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
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
