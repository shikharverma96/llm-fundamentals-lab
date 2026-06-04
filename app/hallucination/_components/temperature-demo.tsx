'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useId, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TemperatureDemo as TDemo, TemperatureSample } from '@/lib/schemas/hallucination';
import { cn } from '@/lib/utils';

interface Props {
  demo: TDemo;
}

const RISK_TONE: Record<TemperatureSample['hallucinationRisk'], string> = {
  low: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
  high: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30',
};

const RISK_LABEL: Record<TemperatureSample['hallucinationRisk'], string> = {
  low: 'Low hallucination risk',
  medium: 'Medium hallucination risk',
  high: 'High hallucination risk',
};

function nearestSample(samples: ReadonlyArray<TemperatureSample>, t: number): TemperatureSample {
  const first = samples[0];
  if (!first) {
    throw new Error('Temperature demo requires at least one sample');
  }
  let best = first;
  let bestDiff = Math.abs(first.temperature - t);
  for (let i = 1; i < samples.length; i += 1) {
    const s = samples[i];
    if (!s) continue;
    const diff = Math.abs(s.temperature - t);
    if (diff < bestDiff) {
      best = s;
      bestDiff = diff;
    }
  }
  return best;
}

export function TemperatureDemo({ demo }: Props): React.ReactElement {
  const sliderId = useId();
  const [value, setValue] = useState<number>(0);

  const active = useMemo(() => nearestSample(demo.samples, value), [demo.samples, value]);

  const tickLabels = useMemo(
    () => demo.samples.map((s) => s.temperature.toFixed(1)),
    [demo.samples],
  );

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>Same prompt, three temperatures</CardTitle>
        <p className="text-sm text-muted-foreground">
          Mathematically, temperature <span className="font-mono">T</span> rescales logits before
          softmax:{' '}
          <span className="font-mono">
            p<sub>i</sub> = exp(z<sub>i</sub> / T) / Σ exp(z<sub>j</sub> / T)
          </span>
          . <span className="font-mono">T → 0</span> collapses the distribution onto the argmax
          (greedy). <span className="font-mono">T = 1</span> samples from the raw softmax.{' '}
          <span className="font-mono">T &gt; 1</span> flattens the distribution, lifting unlikely
          tokens — exactly the regime where fluent fabrication appears.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-md border bg-muted/40 p-3 text-sm">
          {demo.systemPrompt !== null && (
            <p>
              <span className="font-semibold">System:</span>{' '}
              <span className="text-muted-foreground">{demo.systemPrompt}</span>
            </p>
          )}
          <p className="mt-1">
            <span className="font-semibold">Prompt:</span> {demo.prompt}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor={sliderId} className="text-sm font-medium">
              Temperature
            </label>
            <span className="font-mono text-sm tabular-nums">
              T = {active.temperature.toFixed(1)}
            </span>
          </div>
          <input
            id={sliderId}
            type="range"
            min={0}
            max={demo.samples.length - 1}
            step={1}
            value={demo.samples.findIndex((s) => s.temperature === active.temperature)}
            onChange={(e) => {
              const idx = Number(e.target.value);
              const next = demo.samples[idx];
              if (next) setValue(next.temperature);
            }}
            aria-label="Sampling temperature"
            aria-valuetext={active.label}
            className={cn(
              'h-2 w-full cursor-pointer appearance-none rounded-full bg-muted',
              '[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5',
              '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm',
              '[&::-webkit-slider-thumb]:transition-transform',
              '[&::-webkit-slider-thumb]:hover:scale-110',
              '[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5',
              '[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full',
              '[&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
          />
          <div className="flex justify-between px-1 text-xs text-muted-foreground">
            {tickLabels.map((t, i) => (
              <span key={i} className="font-mono tabular-nums">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.temperature}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {active.label}
                </Badge>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                    RISK_TONE[active.hallucinationRisk],
                  )}
                >
                  {RISK_LABEL[active.hallucinationRisk]}
                </span>
              </div>
              <pre className="whitespace-pre-wrap rounded-md border bg-card p-4 font-mono text-sm leading-relaxed">
                {active.output}
              </pre>
              <p className="text-sm text-muted-foreground">{active.annotation}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
