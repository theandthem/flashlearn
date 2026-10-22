// Loading placeholder shown while a deck is generated. The pulsing bars are
// decorative (aria-hidden); the status text is announced politely to screen readers.
export function LoadingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <p role="status" className="sr-only">
        Generating your deck, please wait…
      </p>
      <div aria-hidden="true" className="space-y-4">
        <div className="h-8 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-40 animate-pulse rounded-xl bg-slate-200" />
        <div className="flex gap-3">
          <div className="h-10 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-24 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </div>
  )
}
