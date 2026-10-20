import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { SampleReviews } from "@/components/landing/sample-reviews";
import { Button } from "@/components/ui/button";
import { homeFor } from "@/lib/roles";
import { getCurrentUser } from "@/lib/server/session";

const steps = [
  {
    title: "Submit",
    text: "Add your project name, GitHub repository, live link and a short description.",
  },
  {
    title: "Get reviewed",
    text: "A mentor opens both links, then approves the project or rejects it.",
  },
  {
    title: "Learn from feedback",
    text: "The mentor's feedback appears on your submission, with the date of the review.",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user.role));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <Brand />
        <nav aria-label="Account" className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-14 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <h1 className="max-w-xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Submit your project. Get a real review.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
              Students share a repository and a live link. Mentors approve it or
              say exactly what to fix.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/signup">Create an account</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
            </div>
            <p className="mt-6 max-w-md text-sm text-muted-foreground">
              Reviewing this project? The login page has one-click demo accounts
              for both roles.
            </p>
          </div>
          <SampleReviews />
        </section>

        <section
          aria-labelledby="how-it-works"
          className="border-y bg-muted/50"
        >
          <div className="mx-auto w-full max-w-6xl px-4 py-14">
            <h2
              id="how-it-works"
              className="text-2xl font-semibold tracking-tight"
            >
              How it works
            </h2>
            <ol className="mt-8 grid gap-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title}>
                  <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer>
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-muted-foreground">
          Built with Next.js, Express, PostgreSQL and Prisma.
        </div>
      </footer>
    </div>
  );
}
