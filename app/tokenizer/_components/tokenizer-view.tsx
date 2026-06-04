'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProviderPricingFile, TokenizerFamily } from '@/lib/schemas/pricing';
import { TOKENIZERS } from '@/lib/tokenizer';

import { CostProjection } from './cost-projection';
import { Leaderboard } from './leaderboard';
import { LearnPanel } from './learn-panel';
import { StatsPanel } from './stats-panel';
import { TokenViz } from './token-viz';
import { countTokens, type EngineResult, tokenizeWith } from './tokenizer-engine';

const DEFAULT_TEXT = `The quick brown fox jumps over the lazy dog.

Tokenization is the first step in how an LLM reads your input. Different models split text into different units — and you pay per token, so the choice matters.`;

interface Props {
  pricing: ProviderPricingFile;
}

export function TokenizerView({ pricing }: Props): React.ReactElement {
  const [text, setText] = useState<string>(DEFAULT_TEXT);
  const [activeTokenizer, setActiveTokenizer] = useState<TokenizerFamily>('o200k_base');
  const [vizResult, setVizResult] = useState<EngineResult>({ tokens: [], count: 0 });
  const [vizLoading, setVizLoading] = useState<boolean>(false);
  const [counts, setCounts] = useState<Map<TokenizerFamily, number | 'pending' | 'error'>>(
    () => new Map(TOKENIZERS.map((t) => [t.id, 'pending' as const])),
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced tokenization for the active tokenizer (visualization)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    let cancelled = false;
    setVizLoading(true);
    debounceRef.current = setTimeout(() => {
      tokenizeWith(activeTokenizer, text)
        .then((r) => {
          if (!cancelled) setVizResult(r);
        })
        .catch((err) => {
          if (!cancelled) {
            // eslint-disable-next-line no-console
            console.error('tokenize failed', err);
            setVizResult({ tokens: [], count: 0 });
          }
        })
        .finally(() => {
          if (!cancelled) setVizLoading(false);
        });
    }, 180);
    return () => {
      cancelled = true;
    };
  }, [text, activeTokenizer]);

  // Background counts for every tokenizer (leaderboard + cost projection)
  useEffect(() => {
    let cancelled = false;
    setCounts((prev) => {
      const next = new Map(prev);
      for (const t of TOKENIZERS) next.set(t.id, 'pending');
      return next;
    });

    for (const t of TOKENIZERS) {
      countTokens(t.id, text)
        .then((c) => {
          if (cancelled) return;
          setCounts((prev) => {
            const next = new Map(prev);
            next.set(t.id, c);
            return next;
          });
        })
        .catch(() => {
          if (cancelled) return;
          setCounts((prev) => {
            const next = new Map(prev);
            next.set(t.id, 'error');
            return next;
          });
        });
    }
    return () => {
      cancelled = true;
    };
  }, [text]);

  const numericCounts = useMemo(() => {
    const result: Array<{ tokenizer: TokenizerFamily; count: number }> = [];
    for (const [k, v] of counts.entries()) {
      if (typeof v === 'number') result.push({ tokenizer: k, count: v });
    }
    return result;
  }, [counts]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label htmlFor="tokenizer-input" className="sr-only">
            Text to tokenize
          </label>
          <textarea
            id="tokenizer-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            spellCheck={false}
            className="w-full resize-y rounded-md border bg-background p-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Visualize:</span>
            {TOKENIZERS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTokenizer(t.id)}
                aria-pressed={activeTokenizer === t.id}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                  activeTokenizer === t.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input bg-background hover:bg-accent'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <TokenViz result={vizResult} loading={vizLoading} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <StatsPanel text={text} result={vizResult} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Compression leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Leaderboard counts={numericCounts} text={text} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Projected cost · 1,000 requests</CardTitle>
          </CardHeader>
          <CardContent>
            <CostProjection pricing={pricing} counts={counts} text={text} />
          </CardContent>
        </Card>
      </div>

      <LearnPanel />
    </div>
  );
}
