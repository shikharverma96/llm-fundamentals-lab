'use client';

import type { UsageAssumptions } from '@/lib/cost-engine';

interface Props {
  value: UsageAssumptions;
  onChange: (next: UsageAssumptions) => void;
}

export function AssumptionsForm({ value, onChange }: Props): React.ReactElement {
  const setField = (key: keyof UsageAssumptions, raw: string): void => {
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return;
    onChange({ ...value, [key]: Math.floor(n) });
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Field
        id="input-tokens"
        label="Input tokens / request"
        value={value.inputTokensPerRequest}
        onChange={(v) => setField('inputTokensPerRequest', v)}
      />
      <Field
        id="output-tokens"
        label="Output tokens / request"
        value={value.outputTokensPerRequest}
        onChange={(v) => setField('outputTokensPerRequest', v)}
      />
      <Field
        id="requests-day"
        label="Requests / day"
        value={value.requestsPerDay}
        onChange={(v) => setField('requestsPerDay', v)}
      />
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (next: string) => void;
}): React.ReactElement {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}
