'use client';

import { Badge } from '@/components/ui/badge';
import type { ScoredModel } from '@/lib/cost-engine';
import { PRIVACY_LABELS, PROVIDER_LABELS } from '@/lib/schemas/pricing';
import { formatNumber, formatUSD } from '@/lib/utils';

interface Props {
  rows: readonly ScoredModel[];
}

export function ComparisonMatrix({ rows }: Props): React.ReactElement {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">Monthly cost, latency, privacy, and context window per LLM</caption>
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th scope="col" className="py-2 pr-3">
              Provider
            </th>
            <th scope="col" className="py-2 pr-3">
              Model
            </th>
            <th scope="col" className="py-2 pr-3 text-right">
              Monthly
            </th>
            <th scope="col" className="py-2 pr-3 text-right">
              Per request
            </th>
            <th scope="col" className="py-2 pr-3 text-right">
              p50 latency
            </th>
            <th scope="col" className="py-2 pr-3">
              Privacy
            </th>
            <th scope="col" className="py-2 pr-3 text-right">
              Context
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ model, cost }, idx) => (
            <tr
              key={model.id}
              className={`border-b transition-colors ${idx === 0 ? 'bg-primary/5' : 'hover:bg-muted/40'}`}
            >
              <td className="py-2 pr-3">{PROVIDER_LABELS[model.provider]}</td>
              <td className="py-2 pr-3 font-medium">
                {model.modelLabel}
                {idx === 0 && (
                  <Badge variant="secondary" className="ml-2">
                    Cheapest
                  </Badge>
                )}
              </td>
              <td className="py-2 pr-3 text-right font-semibold tabular-nums">
                {model.provider === 'on-device' ? 'Free' : formatUSD(cost.monthlyUSD)}
              </td>
              <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground">
                {model.provider === 'on-device' ? '—' : formatUSD(cost.perRequestUSD, 6)}
              </td>
              <td className="py-2 pr-3 text-right tabular-nums">
                {formatNumber(model.p50LatencyMs)} ms
              </td>
              <td className="py-2 pr-3">
                <PrivacyBadge level={model.privacy} />
              </td>
              <td className="py-2 pr-3 text-right tabular-nums">
                {formatNumber(model.contextWindow)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PrivacyBadge({ level }: { level: keyof typeof PRIVACY_LABELS }): React.ReactElement {
  const tone =
    level === 'on-device'
      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200'
      : level === 'private-cloud'
        ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200'
        : 'bg-slate-100 text-slate-900 dark:bg-slate-700/40 dark:text-slate-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
      {PRIVACY_LABELS[level]}
    </span>
  );
}
