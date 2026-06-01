'use client';

import { formatNumber } from '@/lib/utils';

import type { EngineResult } from './tokenizer-engine';

interface Props {
  text: string;
  result: EngineResult;
}

export function StatsPanel({ text, result }: Props): React.ReactElement {
  const chars = text.length;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const tokens = result.count;
  const charsPerToken = tokens === 0 ? 0 : chars / tokens;

  return (
    <dl className="grid grid-cols-2 gap-3 text-sm">
      <Stat label="Characters" value={formatNumber(chars)} />
      <Stat label="Words" value={formatNumber(words)} />
      <Stat label="Tokens" value={formatNumber(tokens)} />
      <Stat
        label="Chars / token"
        value={charsPerToken === 0 ? '—' : charsPerToken.toFixed(2)}
        hint="Higher = more compact for this tokenizer."
      />
    </dl>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}): React.ReactElement {
  return (
    <div className="rounded-md border bg-muted/40 p-3">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums">{value}</dd>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
