'use client';

import { motion } from 'framer-motion';

import { Card, CardContent } from '@/components/ui/card';
import type { QuantizationVariant } from '@/lib/schemas/benchmarks';
import { formatBytes, formatNumber } from '@/lib/utils';

interface MetricRow {
  label: string;
  selectedValue: string;
  baselineValue: string;
  deltaPct: number | null;
  /** "lower" → smaller is better; "higher" → bigger is better. */
  direction: 'lower' | 'higher';
}

function rows(baseline: QuantizationVariant, selected: QuantizationVariant): MetricRow[] {
  const pct = (sel: number, base: number): number => (base === 0 ? 0 : ((sel - base) / base) * 100);
  return [
    {
      label: 'File size',
      selectedValue: formatBytes(selected.fileSizeMB),
      baselineValue: formatBytes(baseline.fileSizeMB),
      deltaPct: pct(selected.fileSizeMB, baseline.fileSizeMB),
      direction: 'lower',
    },
    {
      label: 'Peak RAM',
      selectedValue: formatBytes(selected.peakRamMB),
      baselineValue: formatBytes(baseline.peakRamMB),
      deltaPct: pct(selected.peakRamMB, baseline.peakRamMB),
      direction: 'lower',
    },
    {
      label: 'Throughput',
      selectedValue: `${formatNumber(selected.tokensPerSec, { maximumFractionDigits: 1 })} tok/s`,
      baselineValue: `${formatNumber(baseline.tokensPerSec, { maximumFractionDigits: 1 })} tok/s`,
      deltaPct: pct(selected.tokensPerSec, baseline.tokensPerSec),
      direction: 'higher',
    },
    {
      label: 'Perplexity (WikiText-2)',
      selectedValue: selected.perplexityWikitext2.toFixed(2),
      baselineValue: baseline.perplexityWikitext2.toFixed(2),
      deltaPct: pct(selected.perplexityWikitext2, baseline.perplexityWikitext2),
      direction: 'lower',
    },
    {
      label: 'MMLU-mini',
      selectedValue: `${(selected.mmluMini * 100).toFixed(1)}%`,
      baselineValue: `${(baseline.mmluMini * 100).toFixed(1)}%`,
      deltaPct: pct(selected.mmluMini, baseline.mmluMini),
      direction: 'higher',
    },
  ];
}

function deltaTone(delta: number, direction: 'lower' | 'higher'): string {
  if (Math.abs(delta) < 0.5) return 'text-muted-foreground';
  const positive = direction === 'lower' ? delta < 0 : delta > 0;
  return positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400';
}

interface Props {
  baseline: QuantizationVariant;
  selected: QuantizationVariant;
}

export function MetricCards({ baseline, selected }: Props): React.ReactElement {
  const r = rows(baseline, selected);
  return (
    <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
      {r.map((row) => (
        <Card key={row.label}>
          <CardContent className="space-y-1 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{row.label}</p>
            <motion.p
              key={row.selectedValue}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="text-2xl font-semibold tabular-nums"
            >
              {row.selectedValue}
            </motion.p>
            <p className="text-xs text-muted-foreground">
              vs FP16: {row.baselineValue}{' '}
              {row.deltaPct !== null && (
                <span className={deltaTone(row.deltaPct, row.direction)}>
                  ({row.deltaPct >= 0 ? '+' : ''}
                  {row.deltaPct.toFixed(1)}%)
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
