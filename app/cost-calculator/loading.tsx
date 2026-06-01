export default function Loading(): React.ReactElement {
  return (
    <div aria-busy aria-live="polite" className="space-y-6">
      <div className="h-10 w-2/3 animate-pulse rounded bg-muted" />
      <div className="h-32 animate-pulse rounded-xl border bg-muted" />
      <div className="h-96 animate-pulse rounded-xl border bg-muted" />
    </div>
  );
}
