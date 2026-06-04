'use client';

import { useMemo, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Segmented } from '@/components/ui/segmented';
import type {
  QuantizationBenchmarkFile,
  QuantizationLevel,
  QuantizationVariant,
} from '@/lib/schemas/benchmarks';
import { QUANTIZATION_LABELS } from '@/lib/schemas/benchmarks';

import { LearnPanel } from './learn-panel';
import { MetricCards } from './metric-cards';
import { ParetoChart } from './pareto-chart';
import { SampleDiff } from './sample-diff';
import { Verdict } from './verdict';

interface Props {
  data: QuantizationBenchmarkFile;
}

export function QuantizationView({ data }: Props): React.ReactElement {
  const baseline: QuantizationVariant = useMemo(() => {
    const fp16 = data.variants.find((v) => v.level === 'fp16');
    return fp16 ?? data.variants[0]!;
  }, [data.variants]);

  const [selectedLevel, setSelectedLevel] = useState<QuantizationLevel>('q4_k_m');

  const selected: QuantizationVariant = useMemo(() => {
    return data.variants.find((v) => v.level === selectedLevel) ?? baseline;
  }, [data.variants, selectedLevel, baseline]);

  const options = useMemo(
    () =>
      data.variants.map((v) => ({
        value: v.level,
        label: QUANTIZATION_LABELS[v.level],
        description: `${v.bitsPerWeight.toFixed(2)} bits/weight`,
      })),
    [data.variants],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Segmented
          options={options}
          value={selectedLevel}
          onChange={setSelectedLevel}
          ariaLabel="Quantization level"
        />
        <p className="text-xs text-muted-foreground">
          Reference hardware: {data.referenceHardware.cpu}, {data.referenceHardware.runtime}
        </p>
      </div>

      <div aria-live="polite">
        <MetricCards baseline={baseline} selected={selected} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Size vs Quality (Pareto)</CardTitle>
          </CardHeader>
          <CardContent>
            <ParetoChart variants={data.variants} selectedLevel={selectedLevel} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Verdict</CardTitle>
          </CardHeader>
          <CardContent>
            <Verdict baseline={baseline} selected={selected} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sample outputs</CardTitle>
        </CardHeader>
        <CardContent>
          <SampleDiff
            baseline={baseline}
            selected={selected}
            prompt={data.promptSet.prompt}
            systemPrompt={data.promptSet.systemPrompt}
          />
        </CardContent>
      </Card>

      <LearnPanel />
    </div>
  );
}
