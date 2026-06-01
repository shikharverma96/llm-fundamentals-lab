'use client';

import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import type { TokenizerFamily } from '@/lib/schemas/pricing';
import { rankByCompactness } from '@/lib/tokenizer';

interface Props {
  counts: ReadonlyArray<{ tokenizer: TokenizerFamily; count: number }>;
  text: string;
}

export function Leaderboard({ counts, text }: Props): React.ReactElement {
  const rows = useMemo(() => rankByCompactness(counts, text), [counts, text]);
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">Counting tokens…</p>;
  }
  const best = rows[0]!.count;
  return (
    <ol className="space-y-2 text-sm">
      {rows.map((row, idx) => {
        const overhead = best === 0 ? 0 : ((row.count - best) / best) * 100;
        return (
          <li
            key={row.tokenizer}
            className="flex items-center justify-between gap-3 rounded-md border bg-card p-3"
          >
            <div className="flex items-center gap-3">
              <span className="w-5 text-xs font-mono text-muted-foreground">{idx + 1}</span>
              <span className="font-medium">{row.label}</span>
              {idx === 0 && <Badge variant="secondary">Most compact</Badge>}
            </div>
            <div className="text-right">
              <div className="font-semibold tabular-nums">{row.count.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                {row.charsPerToken.toFixed(2)} chars/tok
                {overhead > 0 && <> · +{overhead.toFixed(1)}%</>}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
