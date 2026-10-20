import { Check } from "lucide-react";
import Link from "next/link";
import { ReviewPreview } from "./review-preview";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2.5 font-semibold tracking-tight"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Check className="size-4" strokeWidth={3} />
          </span>
          Review Dashboard
        </Link>
        <div className="mx-auto flex w-full max-w-[26rem] flex-1 flex-col justify-center py-12">
          {children}
        </div>
      </div>
      <aside aria-hidden="true" className="hidden bg-[#0d1230] lg:block">
        <ReviewPreview />
      </aside>
    </div>
  );
}
