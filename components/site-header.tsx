import Link from 'next/link';

const NAV = [
  { href: '/quantization', label: 'Quantization' },
  { href: '/tokenizer', label: 'Tokenizer' },
  { href: '/cost-calculator', label: 'Cost Calculator' },
] as const;

export function SiteHeader(): React.ReactElement {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
          <span>LLM Fundamentals Lab</span>
        </Link>
        <nav aria-label="Main">
          <ul className="flex items-center gap-1 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
