'use client';

import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Segmented } from '@/components/ui/segmented';
import { cn, formatNumber } from '@/lib/utils';

// Approximate tokens ≈ words for English prose. Good enough for an illustrative slider.
function splitWords(text: string): string[] {
  return text.split(/(\s+)/).filter((s) => s.length > 0);
}

function tokenCount(text: string): number {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

interface Chunk {
  index: number;
  startWord: number;
  endWord: number;
  text: string;
  overlapStartWord: number | null;
  overlapEndWord: number | null;
}

function buildChunks(text: string, size: number, overlap: number): Chunk[] {
  const tokens = text
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);
  const stride = Math.max(1, size - overlap);
  const chunks: Chunk[] = [];
  for (let start = 0, i = 0; start < tokens.length; start += stride, i += 1) {
    const end = Math.min(tokens.length, start + size);
    const slice = tokens.slice(start, end);
    if (slice.length === 0) break;
    const prev = chunks[chunks.length - 1];
    const overlapStartWord = prev && overlap > 0 ? start : null;
    const overlapEndWord = prev && overlap > 0 ? Math.min(prev.endWord, end) : null;
    chunks.push({
      index: i,
      startWord: start,
      endWord: end,
      text: slice.join(' '),
      overlapStartWord,
      overlapEndWord:
        overlapStartWord !== null && overlapEndWord !== null && overlapEndWord > overlapStartWord
          ? overlapEndWord
          : null,
    });
    if (end >= tokens.length) break;
  }
  return chunks;
}

const SIZE_OPTIONS = [
  { value: '50', label: '50' },
  { value: '150', label: '150' },
  { value: '300', label: '300' },
  { value: '500', label: '500' },
] as const;

const OVERLAP_OPTIONS = [
  { value: '0', label: '0' },
  { value: '20', label: '20' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
] as const;

type SizeValue = (typeof SIZE_OPTIONS)[number]['value'];
type OverlapValue = (typeof OVERLAP_OPTIONS)[number]['value'];

interface Props {
  initialText: string;
}

const CHUNK_PALETTE = [
  'border-sky-400/70 bg-sky-50 dark:bg-sky-950/40',
  'border-emerald-400/70 bg-emerald-50 dark:bg-emerald-950/40',
  'border-violet-400/70 bg-violet-50 dark:bg-violet-950/40',
  'border-amber-400/70 bg-amber-50 dark:bg-amber-950/40',
  'border-rose-400/70 bg-rose-50 dark:bg-rose-950/40',
  'border-cyan-400/70 bg-cyan-50 dark:bg-cyan-950/40',
  'border-fuchsia-400/70 bg-fuchsia-50 dark:bg-fuchsia-950/40',
  'border-lime-400/70 bg-lime-50 dark:bg-lime-950/40',
] as const;

function paletteFor(i: number): string {
  return CHUNK_PALETTE[i % CHUNK_PALETTE.length] ?? CHUNK_PALETTE[0];
}

function tradeoffNote(size: number, overlap: number): { headline: string; detail: string } {
  if (size <= 50) {
    return {
      headline: 'Tiny chunks → high precision, low recall',
      detail:
        'Each chunk is laser-focused, so similarity scores are sharp. But facts that span more than ~30 words get fragmented and the top-K becomes noisy.',
    };
  }
  if (size >= 500) {
    return {
      headline: 'Large chunks → topic dilution',
      detail:
        'Every chunk now covers several ideas. Similarity averages across them, so off-topic chunks score moderately high and the LLM has to wade through filler.',
    };
  }
  if (overlap === 0) {
    return {
      headline: 'No overlap → chunk-boundary cliff',
      detail:
        'A sentence whose answer straddles a boundary becomes unretrievable. Add at least 10-20% overlap and the cliff disappears.',
    };
  }
  return {
    headline: 'Reasonable balance',
    detail:
      'For typical English prose, 200-400 tokens with 10-20% overlap is a defensible default. Tune against your eval set, not vibes.',
  };
}

// Approximate "characters per token" the LLM cost calc usually assumes.
// For this educational demo we keep it conservative: 1 word ≈ 1.3 tokens.
function wordsToTokens(words: number): number {
  return Math.round(words * 1.3);
}

export function ChunkingDemo({ initialText }: Props): React.ReactElement {
  const [text, setText] = useState<string>(initialText);
  const [size, setSize] = useState<SizeValue>('150');
  const [overlap, setOverlap] = useState<OverlapValue>('20');

  const sizeNum = Number(size);
  const overlapNum = Math.min(Number(overlap), sizeNum - 1);

  const totalTokens = useMemo(() => tokenCount(text), [text]);
  const chunks = useMemo(() => buildChunks(text, sizeNum, overlapNum), [text, sizeNum, overlapNum]);

  const totalOverlapTokens = chunks.reduce((acc, c) => {
    if (c.overlapStartWord !== null && c.overlapEndWord !== null) {
      return acc + (c.overlapEndWord - c.overlapStartWord);
    }
    return acc;
  }, 0);

  const tradeoff = tradeoffNote(sizeNum, overlapNum);

  const words = splitWords(text);

  // For visualization: precompute, for each non-whitespace word index, whether it lies in an overlap region.
  const wordIsOverlap = useMemo(() => {
    const flags: boolean[] = [];
    let wordIdx = 0;
    for (const w of words) {
      if (/^\s+$/.test(w)) {
        flags.push(false);
        continue;
      }
      const inOverlap = chunks.some(
        (c) =>
          c.overlapStartWord !== null &&
          c.overlapEndWord !== null &&
          wordIdx >= c.overlapStartWord &&
          wordIdx < c.overlapEndWord,
      );
      flags.push(inOverlap);
      wordIdx += 1;
    }
    return flags;
  }, [words, chunks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chunking, interactive</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="chunk-input" className="text-sm font-medium">
            Sample document
          </label>
          <textarea
            id="chunk-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            spellCheck={false}
            className="w-full resize-y rounded-md border bg-background p-3 text-sm leading-relaxed shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            {formatNumber(totalTokens)} words · ≈{formatNumber(wordsToTokens(totalTokens))} tokens
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium">Chunk size (tokens)</p>
            <Segmented
              ariaLabel="Chunk size"
              value={size}
              onChange={setSize}
              options={SIZE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Overlap (tokens)</p>
            <Segmented
              ariaLabel="Chunk overlap"
              value={overlap}
              onChange={setOverlap}
              options={OVERLAP_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
          </div>
        </div>

        <div className="grid gap-3 text-sm md:grid-cols-3" aria-live="polite">
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Chunks</p>
            <p className="text-2xl font-semibold tabular-nums">{chunks.length}</p>
          </div>
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Stride</p>
            <p className="text-2xl font-semibold tabular-nums">
              {Math.max(1, sizeNum - overlapNum)} tok
            </p>
          </div>
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Overlap tokens</p>
            <p className="text-2xl font-semibold tabular-nums">{totalOverlapTokens}</p>
          </div>
        </div>

        <div className="rounded-lg border border-dashed bg-background p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Document with overlap highlighted
          </p>
          <p className="text-sm leading-relaxed">
            {words.map((w, i) => {
              if (/^\s+$/.test(w)) return <span key={i}>{w}</span>;
              const overlapHit = wordIsOverlap[i] === true;
              return (
                <span
                  key={i}
                  className={cn(
                    overlapHit ? 'rounded bg-amber-200/70 px-0.5 dark:bg-amber-700/40' : '',
                  )}
                >
                  {w}
                </span>
              );
            })}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Resulting chunks</p>
          <div className="grid gap-3 md:grid-cols-2">
            {chunks.map((c) => (
              <motion.div
                key={c.index}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: c.index * 0.02 }}
                className={cn('rounded-lg border-2 p-3 text-sm', paletteFor(c.index))}
              >
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold">Chunk #{c.index + 1}</span>
                  <span className="font-mono text-muted-foreground">
                    [{c.startWord}–{c.endWord})
                  </span>
                </div>
                <p className="leading-relaxed">{c.text}</p>
                {c.overlapStartWord !== null && c.overlapEndWord !== null ? (
                  <p className="mt-2 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                    overlaps previous chunk on tokens {c.overlapStartWord}–{c.overlapEndWord}
                  </p>
                ) : null}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border-l-4 border-primary bg-muted/40 p-4">
          <p className="text-sm font-semibold">{tradeoff.headline}</p>
          <p className="mt-1 text-sm text-muted-foreground">{tradeoff.detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}
