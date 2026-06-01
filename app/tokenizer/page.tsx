import type { Metadata } from 'next';

import { providerPricing } from '@/lib/data';

import { TokenizerView } from './_components/tokenizer-view';

export const metadata: Metadata = {
  title: 'Tokenizer Playground',
  description:
    'Compare GPT-4o, GPT-4, Llama 3, Mistral, and Gemma tokenizers side-by-side. See how token count drives cost.',
};

export default function TokenizerPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Module B
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Tokenizer Playground</h1>
        <p className="max-w-3xl text-muted-foreground">
          Paste any text. Each tokenizer runs in your browser — nothing is uploaded.
        </p>
      </header>
      <TokenizerView pricing={providerPricing} />
    </div>
  );
}
