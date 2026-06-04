import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PromptPair } from '@/lib/schemas/hallucination';

interface Props {
  pairs: ReadonlyArray<PromptPair>;
}

export function PromptPatterns({ pairs }: Props): React.ReactElement {
  return (
    <div className="space-y-4">
      {pairs.map((pair) => (
        <Card key={pair.id}>
          <CardHeader>
            <CardTitle className="text-base">{pair.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-300">
                  Bad
                </p>
                <pre className="whitespace-pre-wrap rounded border bg-card p-2 font-mono text-xs leading-relaxed">
                  {pair.bad.prompt}
                </pre>
                <p className="text-xs">
                  <span className="font-semibold">Likely output: </span>
                  <span className="italic text-muted-foreground">{pair.bad.likelyOutput}</span>
                </p>
                <p className="text-xs">
                  <span className="font-semibold">Problem: </span>
                  <span className="text-muted-foreground">{pair.bad.problem}</span>
                </p>
              </div>
              <div className="space-y-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Good
                </p>
                <pre className="whitespace-pre-wrap rounded border bg-card p-2 font-mono text-xs leading-relaxed">
                  {pair.good.prompt}
                </pre>
                <p className="text-xs">
                  <span className="font-semibold">Likely output: </span>
                  <span className="italic text-muted-foreground">{pair.good.likelyOutput}</span>
                </p>
                <p className="text-xs">
                  <span className="font-semibold">Why this works: </span>
                  <span className="text-muted-foreground">{pair.good.why}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
