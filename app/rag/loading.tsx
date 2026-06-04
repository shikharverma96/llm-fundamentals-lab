export default function Loading(): React.ReactElement {
  return (
    <div aria-busy aria-live="polite" className="space-y-6">
      <div className="h-12 w-2/3 animate-pulse rounded bg-muted" />
      <div className="h-10 w-full animate-pulse rounded bg-muted" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl border bg-muted" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-xl border bg-muted" />
    </div>
  );
}
