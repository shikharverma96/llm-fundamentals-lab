import type { Metadata } from 'next';

import { costTemplates, providerPricing } from '@/lib/data';

import { CostCalculatorView } from './_components/cost-calculator-view';

export const metadata: Metadata = {
  title: 'LLM Cost Calculator',
  description:
    'Compare monthly LLM costs, latency, privacy, and context window across OpenAI, Anthropic, Google, Groq, Together AI, and on-device options.',
};

export default function CostCalculatorPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Module C
        </p>
        <h1 className="text-3xl font-bold tracking-tight">LLM Cost Calculator</h1>
        <p className="max-w-3xl text-muted-foreground">
          Pick a use case template, tweak the assumptions, and see what each model would cost you
          per month. Save comparisons locally — nothing leaves your browser.
        </p>
      </header>
      <CostCalculatorView pricing={providerPricing} templates={costTemplates} />
    </div>
  );
}
