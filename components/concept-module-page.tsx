import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConceptModuleFile } from '@/lib/schemas';

interface ConceptModulePageProps {
  /** e.g. "Module H · Agentic AI". */
  eyebrow: string;
  /** Loaded JSON for this module. */
  data: ConceptModuleFile;
}

export function ConceptModulePage({ eyebrow, data }: ConceptModulePageProps): React.ReactElement {
  const { moduleLabel, intro, items, pitfalls, artifact } = data;
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">{moduleLabel}</h1>
        <p className="max-w-3xl text-muted-foreground">{intro}</p>
      </header>

      <section aria-labelledby="items-heading" className="space-y-4">
        <h2 id="items-heading" className="text-xl font-semibold">
          Patterns &amp; mechanisms
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">When: </span>
                  {item.whenToUse}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">How: </span>
                  {item.mechanism}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Trade-off: </span>
                  {item.tradeoff}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="pit-heading" className="space-y-3">
        <h2 id="pit-heading" className="text-xl font-semibold">
          Pitfalls
        </h2>
        <ul className="grid gap-3 text-sm md:grid-cols-2">
          {pitfalls.map((p) => (
            <li key={p.id} className="rounded-lg border bg-card p-4">
              <p className="font-semibold text-foreground">{p.title}</p>
              <p className="mt-1 text-muted-foreground">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="art-heading" className="space-y-3">
        <h2 id="art-heading" className="text-xl font-semibold">
          Lift-and-shift: {artifact.kind === 'code' ? `${artifact.language} skeleton` : 'prompt'}
        </h2>
        <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-4 text-xs leading-relaxed">
          <code>{artifact.content}</code>
        </pre>
      </section>
    </div>
  );
}
