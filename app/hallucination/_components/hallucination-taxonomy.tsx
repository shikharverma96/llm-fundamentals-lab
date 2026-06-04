'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Segmented } from '@/components/ui/segmented';
import {
  HALLUCINATION_TYPE_BLURBS,
  HALLUCINATION_TYPE_LABELS,
  type HallucinationType,
  type TaxonomyExample,
} from '@/lib/schemas/hallucination';

interface Props {
  examples: ReadonlyArray<TaxonomyExample>;
}

export function HallucinationTaxonomy({ examples }: Props): React.ReactElement {
  const [selectedType, setSelectedType] = useState<HallucinationType>('intrinsic');

  const options = useMemo(
    () =>
      examples.map((ex) => ({
        value: ex.type,
        label: HALLUCINATION_TYPE_LABELS[ex.type],
        description: HALLUCINATION_TYPE_BLURBS[ex.type],
      })),
    [examples],
  );

  const selected: TaxonomyExample = useMemo(() => {
    const fallback = examples[0];
    if (!fallback) {
      throw new Error('No taxonomy examples available');
    }
    return examples.find((ex) => ex.type === selectedType) ?? fallback;
  }, [examples, selectedType]);

  return (
    <div className="space-y-4">
      <Segmented
        options={options}
        value={selectedType}
        onChange={setSelectedType}
        ariaLabel="Hallucination type"
      />

      <div aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected.type}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            <Card>
              <CardHeader className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{HALLUCINATION_TYPE_LABELS[selected.type]}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {HALLUCINATION_TYPE_BLURBS[selected.type]}
                  </span>
                </div>
                <CardTitle>{selected.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selected.context !== null && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Context provided to the model
                    </p>
                    <pre className="mt-1 whitespace-pre-wrap rounded-md border bg-muted/40 p-3 font-mono text-xs leading-relaxed">
                      {selected.context}
                    </pre>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Prompt
                  </p>
                  <pre className="mt-1 whitespace-pre-wrap rounded-md border bg-muted/40 p-3 font-mono text-xs leading-relaxed">
                    {selected.prompt}
                  </pre>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mocked model output
                  </p>
                  <pre className="mt-1 whitespace-pre-wrap rounded-md border border-amber-500/40 bg-amber-500/5 p-3 font-mono text-xs leading-relaxed">
                    {selected.modelOutput}
                  </pre>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border bg-card p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Why it&rsquo;s wrong
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{selected.whyItsWrong}</p>
                  </div>
                  <div className="rounded-md border bg-card p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      How to catch it
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{selected.giveaway}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
