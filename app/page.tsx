import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MODULES = [
  {
    href: '/quantization',
    title: 'Quantization Benchmark Visualizer',
    description:
      'Watch file size, RAM, throughput, perplexity, and MMLU shift across FP16 → INT2 for Qwen2.5-0.5B. See where the quality cliff really is.',
    eyebrow: 'Module A',
  },
  {
    href: '/tokenizer',
    title: 'Tokenizer Playground',
    description:
      'Paste any text. Compare token counts across GPT-4o, GPT-4, Llama 3, Mistral, and Gemma — and see what that means for cost.',
    eyebrow: 'Module B',
  },
  {
    href: '/cost-calculator',
    title: 'LLM Cost Calculator',
    description:
      'Pick a use case. Compare monthly cost, latency, privacy, and context window across cloud providers and an on-device estimate.',
    eyebrow: 'Module C',
  },
] as const;

export default function HomePage(): React.ReactElement {
  return (
    <div className="space-y-12">
      <section className="space-y-4 text-balance">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Interactive · static · 100% client side
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Foundational mechanics of large language models — made tangible.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Three small tools that answer the questions most teams quietly Google: what does
          quantization cost you, why do tokenizer choices change the bill, and how do production LLM
          options actually stack up?
        </p>
      </section>

      <section aria-labelledby="modules-heading" className="space-y-6">
        <h2 id="modules-heading" className="text-xl font-semibold">
          Pick a module
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {MODULES.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {m.eyebrow}
                  </p>
                  <CardTitle className="group-hover:underline">{m.title}</CardTitle>
                  <CardDescription className="pt-2">{m.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm font-medium text-primary">Open →</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
