export default function Loading(): React.ReactElement {
  return (
    <div aria-busy aria-live="polite" className="space-y-6">
      <div className="h-12 w-2/3 animate-pulse rounded bg-muted" />
      <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl border bg-muted" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl border bg-muted" />
      <div className="h-48 animate-pulse rounded-xl border bg-muted" />
    </div>
  );
}
