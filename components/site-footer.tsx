export function SiteFooter(): React.ReactElement {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground md:flex-row">
        <p>
          LLM Fundamentals Lab — educational tool. Numbers are reference snapshots; verify against
          provider docs before production use.
        </p>
        <p>MIT License</p>
      </div>
    </footer>
  );
}
