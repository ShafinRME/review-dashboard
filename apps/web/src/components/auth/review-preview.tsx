// Decorative preview of the product's core moment. Illustrative content only.
export function ReviewPreview() {
  return (
    <div className="flex h-full flex-col justify-center gap-10 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:22px_22px] p-12 xl:p-20">
      <div className="max-w-md">
        <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white xl:text-4xl">
          Every project gets a real review.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-white/70">
          Submit your repository and live link. A mentor approves it or tells
          you exactly what to fix.
        </p>
      </div>

      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-[#0d1230] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold tracking-tight">Blood Book</p>
            <p className="text-sm text-[#5b6279]">Submitted by Nusrat J.</p>
          </div>
          <span className="relative inline-grid h-7 min-w-[7rem] shrink-0 place-items-center">
            <span className="chip-pending absolute inset-0 grid place-items-center rounded-full bg-[#fff4db] text-xs font-medium text-[#8a5a00]">
              Pending review
            </span>
            <span className="chip-approved absolute inset-0 grid place-items-center rounded-full bg-[#ddf5e8] text-xs font-medium text-[#0f6b45]">
              Approved
            </span>
          </span>
        </div>

        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex gap-3">
            <dt className="w-20 shrink-0 text-[#5b6279]">Repository</dt>
            <dd className="truncate font-mono text-[13px]">
              github.com/nusrat-j/blood-book
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-20 shrink-0 text-[#5b6279]">Live link</dt>
            <dd className="truncate font-mono text-[13px]">
              blood-book.vercel.app
            </dd>
          </div>
        </dl>

        <div className="review-comment mt-5 flex gap-3 border-t border-[#e3e6ee] pt-5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#0d1230] text-xs font-semibold text-white">
            HM
          </span>
          <div className="text-sm leading-relaxed">
            <p className="font-medium">Head Mentor</p>
            <p className="text-[#5b6279]">
              Validation is solid and the live link works. Add a screenshot to
              the README and this is ready to share.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
