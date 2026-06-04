import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RagPitfall } from '@/lib/schemas/rag';

interface Props {
  pitfalls: RagPitfall[];
}

export function Pitfalls({ pitfalls }: Props): React.ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Common pitfalls</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {pitfalls.map((p) => (
            <li key={p.name} className="rounded-lg border p-4">
              <h3 className="text-base font-semibold">{p.name}</h3>
              <dl className="mt-2 grid gap-2 text-sm md:grid-cols-[7rem_1fr]">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Symptom
                </dt>
                <dd>{p.symptom}</dd>
                <dt className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  Fix
                </dt>
                <dd>{p.fix}</dd>
              </dl>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
