'use client';

import { useMemo } from 'react';

import type { ProviderPricingFile, TokenizerFamily } from '@/lib/schemas/pricing';
import { PROVIDER_LABELS } from '@/lib/schemas/pricing';
import { projectedCostPer1kRequests } from '@/lib/tokenizer';
import { formatUSD } from '@/lib/utils';

interface Props {
  pricing: ProviderPricingFile;
  counts: Map<TokenizerFamily, number | 'pending' | 'error'>;
  text: string;
}

/**
 * Estimate of output tokens generated per request, used purely for the cost
 * projection. The user's text counts as input only; output is a fixed estimate.
 */
const ASSUMED_OUTPUT_TOKENS = 250;

export function CostProjection({ pricing, counts }: Props): React.ReactElement {
  const rows = useMemo(() => {
    return pricing.models.map((m) => {
      const count = counts.get(m.tokenizer);
      if (typeof count !== 'number') {
        return { model: m, status: count, cost: null as number | null };
      }
      const cost = projectedCostPer1kRequests(
        count,
        ASSUMED_OUTPUT_TOKENS,
        m.inputPricePer1M,
        m.outputPricePer1M,
      );
      return { model: m, status: 'ready' as const, cost };
    });
  }, [pricing.models, counts]);

  return (
    <div className="space-y-2 text-sm">
      <p className="text-xs text-muted-foreground">
        Estimate per 1,000 requests with your text as input + {ASSUMED_OUTPUT_TOKENS} output tokens.
      </p>
      <ul className="divide-y divide-border rounded-md border">
        {rows.map(({ model, status, cost }) => (
          <li
            key={model.id}
            className="flex items-center justify-between gap-3 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{model.modelLabel}</p>
              <p className="text-xs text-muted-foreground">
                {PROVIDER_LABELS[model.provider]} · {model.tokenizer}
              </p>
            </div>
            <div className="shrink-0 text-right font-semibold tabular-nums">
              {status === 'pending' && <span className="text-muted-foreground">…</span>}
              {status === 'error' && <span className="text-destructive">err</span>}
              {status === 'ready' && cost !== null && (
                <>
                  {model.provider === 'on-device'
                    ? 'Free'
                    : formatUSD(cost, cost < 1 ? 4 : 2)}
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
