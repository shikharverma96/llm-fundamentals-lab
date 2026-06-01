export default function RootLoading(): React.ReactElement {
  return (
    <div aria-busy aria-live="polite" className="space-y-6">
      <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl border bg-muted" />
        ))}
      </div>
    </div>
  );
}
