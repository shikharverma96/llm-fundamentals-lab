'use client';

import { QUANTIZATION_LABELS, type QuantizationVariant } from '@/lib/schemas/benchmarks';

interface Props {
  baseline: QuantizationVariant;
  selected: QuantizationVariant;
  prompt: string;
  systemPrompt: string | null;
}

export function SampleDiff({ baseline, selected, prompt, systemPrompt }: Props): React.ReactElement {
  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-muted/40 p-3 text-sm">
        {systemPrompt && (
          <p>
            <span className="font-semibold">System:</span>{' '}
            <span className="text-muted-foreground">{systemPrompt}</span>
          </p>
        )}
        <p className="mt-1">
          <span className="font-semibold">Prompt:</span> {prompt}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SampleColumn title={`${QUANTIZATION_LABELS[baseline.level]} (baseline)`} samples={baseline.samples} />
        <SampleColumn title={QUANTIZATION_LABELS[selected.level]} samples={selected.samples} highlight />
      </div>
    </div>
  );
}

function SampleColumn({
  title,
  samples,
  highlight = false,
}: {
  title: string;
  samples: string[];
  highlight?: boolean;
}): React.ReactElement {
  return (
    <div className="space-y-2">
      <h3 className={`text-sm font-semibold ${highlight ? 'text-primary' : 'text-foreground'}`}>{title}</h3>
      <ol className="space-y-2 text-sm">
        {samples.map((s, i) => (
          <li key={i} className="rounded-md border bg-card p-3 leading-relaxed">
            <span className="mr-2 text-xs font-medium text-muted-foreground">#{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}
