import type { Metadata } from 'next';

import { hallucinationExamples } from '@/lib/data';

import { HallucinationTaxonomy } from './_components/hallucination-taxonomy';
import { Mitigations } from './_components/mitigations';
import { PromptPatterns } from './_components/prompt-patterns';
import { TemperatureDemo } from './_components/temperature-demo';
import { WhyItHappens } from './_components/why-it-happens';

export const metadata: Metadata = {
  title: 'Hallucination & Decoding Controls',
  description:
    'What LLM hallucination actually is, the four taxonomy types with worked examples, how temperature / top-p / top-k change risk, and the mitigation patterns that actually work.',
};

export default function HallucinationPage(): React.ReactElement {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Module D
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Hallucination & Decoding Controls</h1>
        <p className="max-w-3xl text-muted-foreground">
          Why fluent models confidently make things up, what knobs change the risk, and the prompt
          patterns that move the needle. Worked examples below — every &ldquo;model output&rdquo; is
          mocked and labelled.
        </p>
      </header>

      <section aria-labelledby="def-heading" className="space-y-3">
        <h2 id="def-heading" className="text-xl font-semibold">
          What &ldquo;hallucination&rdquo; means precisely
        </h2>
        <p className="max-w-3xl text-muted-foreground">
          Hallucination is model-generated content that is{' '}
          <span className="font-medium text-foreground">fluent and confident</span> but is either
          factually wrong, ungrounded in the provided source, or outright fabricated. It is
          <em> not </em>a synonym for &ldquo;error&rdquo;. A truncated reply, a refusal, a parse
          failure, a typo — those are errors, not hallucinations. The defining feature is that the
          output reads like a sober, sourced claim while having no anchor to truth.
        </p>
        <p className="max-w-3xl text-muted-foreground">
          The mechanism matters: an LLM is a next-token predictor optimised for likelihood on its
          training distribution, not for accuracy on your task. When the most likely continuation
          happens to be true, you get a correct answer. When it doesn&apos;t, you get a
          hallucination — delivered with the same prosody.
        </p>
      </section>

      <section aria-labelledby="taxonomy-heading" className="space-y-4">
        <div className="space-y-1">
          <h2 id="taxonomy-heading" className="text-xl font-semibold">
            Four flavours, each with a worked example
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Knowing which kind you&apos;re looking at tells you which mitigation will actually help.
          </p>
        </div>
        <HallucinationTaxonomy examples={hallucinationExamples.taxonomy} />
      </section>

      <section aria-labelledby="why-heading" className="space-y-4">
        <div className="space-y-1">
          <h2 id="why-heading" className="text-xl font-semibold">
            Why it happens
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Five structural causes, none of which are bugs to be patched away.
          </p>
        </div>
        <WhyItHappens />
      </section>

      <section aria-labelledby="temp-heading" className="space-y-4">
        <div className="space-y-1">
          <h2 id="temp-heading" className="text-xl font-semibold">
            Temperature, demystified
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Drag the slider. Same prompt, same model — the only thing changing is how flat the
            sampling distribution is.
          </p>
        </div>
        <TemperatureDemo demo={hallucinationExamples.temperatureDemo} />
      </section>

      <section aria-labelledby="topp-heading" className="space-y-4">
        <div className="space-y-1">
          <h2 id="topp-heading" className="text-xl font-semibold">
            Top-p, top-k, repetition penalty
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Decoding controls that compose with temperature. Use them, don&apos;t fear them.
          </p>
        </div>
        <DecodingControls />
      </section>

      <section aria-labelledby="mit-heading" className="space-y-4">
        <div className="space-y-1">
          <h2 id="mit-heading" className="text-xl font-semibold">
            Mitigations that move the needle
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Ordered roughly by effort-to-impact. The first three are non-negotiable for any
            production system.
          </p>
        </div>
        <Mitigations />
      </section>

      <section aria-labelledby="pp-heading" className="space-y-4">
        <div className="space-y-1">
          <h2 id="pp-heading" className="text-xl font-semibold">
            Prompt patterns: bad vs good
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Three side-by-side rewrites. Each &ldquo;good&rdquo; column is a template you can lift
            directly.
          </p>
        </div>
        <PromptPatterns pairs={hallucinationExamples.promptPairs} />
      </section>
    </div>
  );
}

function DecodingControls(): React.ReactElement {
  const items: Array<{ name: string; what: string; when: string }> = [
    {
      name: 'top-p (nucleus sampling)',
      what: 'Sample only from the smallest set of tokens whose cumulative probability ≥ p. Composes with temperature: temperature shapes the distribution, top-p truncates its tail.',
      when: 'Use p ≈ 0.9 for general chat, ≈ 0.5–0.7 for factual tasks. Setting top-p < 1 is usually a bigger hallucination win than lowering temperature alone, because it kills the long tail of nonsense tokens entirely.',
    },
    {
      name: 'top-k',
      what: 'Sample only from the k highest-probability tokens at each step. Hard truncation by rank, not mass.',
      when: 'Mostly superseded by top-p in modern stacks. Useful when you want a hard cap independent of how peaked the distribution is. k = 40 is a common default.',
    },
    {
      name: 'repetition penalty / frequency penalty',
      what: 'Multiplicatively (or additively) down-weight tokens that have already appeared. Discourages loops and verbatim parroting.',
      when: 'Crank it up when you see the model degenerating into &ldquo;the the the&rdquo; or repeating phrases. Dial it down for code or structured output where repetition is legitimate.',
    },
  ];
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map((it) => (
        <div key={it.name} className="rounded-xl border bg-card p-4 text-card-foreground">
          <p className="font-mono text-sm font-semibold">{it.name}</p>
          <p className="mt-2 text-sm text-muted-foreground">{it.what}</p>
          <p className="mt-3 text-sm">
            <span className="font-medium">When it matters: </span>
            <span className="text-muted-foreground">{it.when}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
