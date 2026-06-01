'use client';

import { useMemo } from 'react';

import type { EngineResult } from './tokenizer-engine';

/**
 * Stable palette of 12 perceptually-distinct hues used to color token spans.
 * Tokens cycle through the palette; this is purely visual and never affects identity.
 */
const PALETTE = [
  'bg-rose-200 text-rose-900',
  'bg-amber-200 text-amber-900',
  'bg-emerald-200 text-emerald-900',
  'bg-sky-200 text-sky-900',
  'bg-violet-200 text-violet-900',
  'bg-pink-200 text-pink-900',
  'bg-yellow-200 text-yellow-900',
  'bg-lime-200 text-lime-900',
  'bg-cyan-200 text-cyan-900',
  'bg-indigo-200 text-indigo-900',
  'bg-fuchsia-200 text-fuchsia-900',
  'bg-teal-200 text-teal-900',
];

interface Props {
  result: EngineResult;
  loading: boolean;
}

export function TokenViz({ result, loading }: Props): React.ReactElement {
  const spans = useMemo(() => result.tokens, [result.tokens]);

  if (loading && spans.length === 0) {
    return (
      <div aria-busy aria-live="polite" className="space-y-2">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <p className="text-xs text-muted-foreground">Loading tokenizer (one-time WASM download)…</p>
      </div>
    );
  }

  if (spans.length === 0) {
    return <p className="text-sm text-muted-foreground">Type some text to see tokens.</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {spans.length.toLocaleString()} tokens.{' '}
        <span className="font-mono">Color = position only; hover to see id.</span>
      </p>
      <div className="rounded-md border bg-muted/40 p-3 font-mono text-sm leading-7">
        {spans.map((s, i) => (
          <span
            key={i}
            title={`#${i + 1} · id=${s.id}`}
            className={`${PALETTE[i % PALETTE.length]} mr-0.5 inline-block rounded px-1 py-0.5`}
          >
            {displayChunk(s.display)}
          </span>
        ))}
      </div>
    </div>
  );
}

function displayChunk(s: string): React.ReactNode {
  // Whitespace becomes invisible inside tinted chips; render it visibly.
  if (s === '\n') return <span aria-hidden>↵</span>;
  if (s.trim() === '' && s.length > 0) return <span aria-hidden>{'·'.repeat(s.length)}</span>;
  return s;
}
