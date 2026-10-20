import { Check } from "lucide-react";
import Link from "next/link";

export function Brand() {
  return (
    <Link
      href="/"
      className="inline-flex w-fit items-center gap-2.5 rounded-md font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Check className="size-4" strokeWidth={3} aria-hidden="true" />
      </span>
      Review Dashboard
    </Link>
  );
}
