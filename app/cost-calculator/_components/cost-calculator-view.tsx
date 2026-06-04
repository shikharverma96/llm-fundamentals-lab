'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { scoreModels, type UsageAssumptions } from '@/lib/cost-engine';
import { downloadCSV, toCSV } from '@/lib/csv';
import type { ProviderPricingFile } from '@/lib/schemas/pricing';
import { PROVIDER_LABELS } from '@/lib/schemas/pricing';
import type { CostTemplatesFile, TemplateId } from '@/lib/schemas/templates';
import { formatUSD } from '@/lib/utils';

import { AssumptionsForm } from './assumptions-form';
import { ComparisonMatrix } from './comparison-matrix';
import { LearnPanel } from './learn-panel';
import { loadSaved, newId, persistSaved, type SavedComparison } from './saved';
import { SavedSidebar } from './saved-sidebar';
import { TemplatePicker } from './template-picker';

interface Props {
  pricing: ProviderPricingFile;
  templates: CostTemplatesFile;
}

export function CostCalculatorView({ pricing, templates }: Props): React.ReactElement {
  const [templateId, setTemplateId] = useState<TemplateId>('chatbot');
  const initial = useMemo(
    () => templates.templates.find((t) => t.id === 'chatbot') ?? templates.templates[0]!,
    [templates.templates],
  );
  const [assumptions, setAssumptions] = useState<UsageAssumptions>({
    inputTokensPerRequest: initial.inputTokensPerRequest,
    outputTokensPerRequest: initial.outputTokensPerRequest,
    requestsPerDay: initial.requestsPerDay,
  });

  const [saved, setSaved] = useState<SavedComparison[]>([]);
  useEffect(() => setSaved(loadSaved()), []);

  const handleTemplate = useCallback(
    (id: TemplateId) => {
      const t = templates.templates.find((x) => x.id === id);
      setTemplateId(id);
      if (t && id !== 'custom') {
        setAssumptions({
          inputTokensPerRequest: t.inputTokensPerRequest,
          outputTokensPerRequest: t.outputTokensPerRequest,
          requestsPerDay: t.requestsPerDay,
        });
      }
    },
    [templates.templates],
  );

  const scored = useMemo(
    () =>
      scoreModels(pricing.models, assumptions).sort(
        (a, b) => a.cost.monthlyUSD - b.cost.monthlyUSD,
      ),
    [pricing.models, assumptions],
  );

  const handleExportCSV = useCallback(() => {
    const rows: ReadonlyArray<ReadonlyArray<unknown>> = [
      [
        'Provider',
        'Model',
        'Monthly cost (USD)',
        'Per-request (USD)',
        'p50 latency (ms)',
        'Privacy',
        'Context window',
      ],
      ...scored.map(({ model, cost }) => [
        PROVIDER_LABELS[model.provider],
        model.modelLabel,
        cost.monthlyUSD.toFixed(4),
        cost.perRequestUSD.toFixed(6),
        model.p50LatencyMs,
        model.privacy,
        model.contextWindow,
      ]),
    ];
    const csv = toCSV(rows);
    const date = new Date().toISOString().slice(0, 10);
    downloadCSV(`llm-cost-comparison-${date}.csv`, csv);
  }, [scored]);

  const handleSave = useCallback(
    (name: string) => {
      const entry: SavedComparison = {
        id: newId(),
        name,
        savedAt: new Date().toISOString(),
        templateId,
        ...assumptions,
      };
      const next = [entry, ...saved].slice(0, 50);
      setSaved(next);
      persistSaved(next);
    },
    [saved, assumptions, templateId],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const next = saved.filter((s) => s.id !== id);
      setSaved(next);
      persistSaved(next);
    },
    [saved],
  );

  const handleRestore = useCallback((entry: SavedComparison) => {
    setTemplateId(entry.templateId);
    setAssumptions({
      inputTokensPerRequest: entry.inputTokensPerRequest,
      outputTokensPerRequest: entry.outputTokensPerRequest,
      requestsPerDay: entry.requestsPerDay,
    });
  }, []);

  const cheapest = scored[0];
  const monthlyMin = cheapest?.cost.monthlyUSD ?? 0;
  const onDevice = scored.find((s) => s.model.provider === 'on-device');

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Pick a use case</CardTitle>
          </CardHeader>
          <CardContent>
            <TemplatePicker
              templates={templates.templates}
              value={templateId}
              onChange={handleTemplate}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Tune assumptions</CardTitle>
          </CardHeader>
          <CardContent>
            <AssumptionsForm
              value={assumptions}
              onChange={(next) => {
                setAssumptions(next);
                setTemplateId('custom');
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle>3. Compare</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleExportCSV}>
                Export CSV
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const name = window.prompt(
                    'Name this comparison',
                    `${templateId} · ${new Date().toLocaleDateString()}`,
                  );
                  if (name) handleSave(name.trim());
                }}
              >
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ComparisonMatrix rows={scored} />
            {cheapest && onDevice && cheapest.model.provider !== 'on-device' && (
              <p className="mt-4 text-xs text-muted-foreground">
                Cheapest cloud option: <strong>{cheapest.model.modelLabel}</strong> at{' '}
                {formatUSD(monthlyMin)} / mo. On-device alternative ({onDevice.model.modelLabel}) is
                free at the margin — privacy and quality tradeoff to weigh.
              </p>
            )}
          </CardContent>
        </Card>

        <LearnPanel />
      </div>

      <SavedSidebar saved={saved} onRestore={handleRestore} onDelete={handleDelete} />
    </div>
  );
}
