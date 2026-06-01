'use client';

import type { CostTemplate, TemplateId } from '@/lib/schemas/templates';

interface Props {
  templates: readonly CostTemplate[];
  value: TemplateId;
  onChange: (id: TemplateId) => void;
}

export function TemplatePicker({ templates, value, onChange }: Props): React.ReactElement {
  return (
    <div role="radiogroup" aria-label="Use case templates" className="grid gap-3 md:grid-cols-3">
      {templates.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(t.id)}
            className={`rounded-lg border p-3 text-left transition-all ${
              active
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-input hover:bg-accent'
            }`}
          >
            <p className="text-sm font-semibold">{t.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
            {t.id !== 'custom' && (
              <p className="mt-2 text-xs font-mono text-muted-foreground">
                {t.inputTokensPerRequest} in · {t.outputTokensPerRequest} out · {t.requestsPerDay}/day
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
