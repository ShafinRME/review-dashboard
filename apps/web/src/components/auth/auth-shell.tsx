import { Brand } from "@/components/brand";
import { ReviewPreview } from "./review-preview";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Brand />
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
