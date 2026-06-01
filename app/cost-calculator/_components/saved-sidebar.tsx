'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { SavedComparison } from './saved';

interface Props {
  saved: readonly SavedComparison[];
  onRestore: (entry: SavedComparison) => void;
  onDelete: (id: string) => void;
}

export function SavedSidebar({ saved, onRestore, onDelete }: Props): React.ReactElement {
  return (
    <aside aria-label="Saved comparisons" className="lg:sticky lg:top-20">
      <Card>
        <CardHeader>
          <CardTitle>Saved comparisons</CardTitle>
        </CardHeader>
        <CardContent>
          {saved.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No saved comparisons yet. Click <strong>Save</strong> after dialing in numbers and
              they’ll appear here. Stored only in your browser.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {saved.map((s) => (
                <li
                  key={s.id}
                  className="group rounded-md border bg-card p-2 transition-colors hover:bg-accent"
                >
                  <button
                    type="button"
                    onClick={() => onRestore(s)}
                    className="block w-full text-left"
                  >
                    <p className="truncate font-medium">{s.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {s.inputTokensPerRequest}/{s.outputTokensPerRequest} tok · {s.requestsPerDay}/day
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.savedAt).toLocaleString()}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(s.id)}
                    className="mt-1 text-xs text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
