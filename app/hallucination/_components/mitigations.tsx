import { Card, CardContent } from '@/components/ui/card';

interface Mitigation {
  name: string;
  why: string;
  catches: ReadonlyArray<'intrinsic' | 'extrinsic' | 'factual' | 'reasoning'>;
  link?: { href: string; label: string };
}

const MITIGATIONS: ReadonlyArray<Mitigation> = [
  {
    name: 'Retrieval-Augmented Generation (RAG)',
    why: 'Fetch relevant documents at query time and force the model to answer from them. Closes the knowledge-cutoff gap and gives you a citation surface. The single biggest factual-hallucination reduction available without retraining.',
    catches: ['factual', 'extrinsic'],
    link: { href: '/rag', label: 'See the RAG module →' },
  },
  {
    name: 'Grounded prompting + explicit "I don\'t know"',
    why: "Inline the source(s) into the prompt with delimiters, and give the model an exact-string fallback ('respond with: not found in source'). High-probability safe completion crowds out the lower-probability fabrication.",
    catches: ['intrinsic', 'extrinsic'],
  },
  {
    name: 'Lower temperature (and top-p < 1) for factual tasks',
    why: 'A peaked distribution makes the argmax token win. You trade stylistic variety for a much lower chance of sampling a creative-but-wrong token. T = 0 is the right default for extraction, classification, and arithmetic.',
    catches: ['factual', 'extrinsic'],
  },
  {
    name: 'Structured outputs (JSON Schema, function calling)',
    why: "Constraining the decoder to a schema makes whole classes of hallucination unrepresentable. The model can't invent a citation field if the schema doesn't have one; can't claim a value outside an enum. Validators downstream catch what slips through.",
    catches: ['extrinsic'],
  },
  {
    name: 'Self-consistency / multi-sample voting',
    why: "Sample N answers at moderate temperature, then take the majority. Hallucinations are usually idiosyncratic — they don't survive being re-rolled. Correct answers cluster, fabrications scatter. Especially powerful for reasoning chains.",
    catches: ['reasoning', 'factual'],
  },
  {
    name: 'Chain-of-thought + verification step',
    why: "Ask for the reasoning, then run a second pass that checks the conclusion against the work. 'Given the steps above, does the final answer follow? If not, fix it.' Catches the failure mode where the model produces a fluent chain that contradicts its own conclusion.",
    catches: ['reasoning'],
  },
  {
    name: 'Evaluation gates with reference datasets',
    why: 'Hold-out a labelled set of inputs with known correct outputs and run it on every prompt or model change. Hallucination rate is a number you can watch over time. Without measurement you have vibes, not engineering.',
    catches: ['intrinsic', 'extrinsic', 'factual', 'reasoning'],
  },
  {
    name: 'Confidence calibration (logprobs, retrieval scores)',
    why: "When the API exposes logprobs, threshold on them — low-confidence completions are disproportionately wrong. For RAG, refuse to answer when top-retrieval similarity is below a tuned cutoff. A confident 'I don't know' beats a confident wrong answer.",
    catches: ['factual', 'extrinsic'],
  },
];

const CATCH_LABEL: Record<'intrinsic' | 'extrinsic' | 'factual' | 'reasoning', string> = {
  intrinsic: 'Intrinsic',
  extrinsic: 'Extrinsic',
  factual: 'Factual',
  reasoning: 'Reasoning',
};

export function Mitigations(): React.ReactElement {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {MITIGATIONS.map((m, idx) => (
        <Card key={m.name}>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                aria-hidden
              >
                {idx + 1}
              </span>
              <div className="space-y-1">
                <p className="font-semibold leading-tight">{m.name}</p>
                <p className="text-sm text-muted-foreground">{m.why}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pl-9">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Helps with:
              </span>
              {m.catches.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs"
                >
                  {CATCH_LABEL[c]}
                </span>
              ))}
              {m.link && (
                <a
                  href={m.link.href}
                  className="ml-auto text-xs font-medium text-primary hover:underline"
                >
                  {m.link.label}
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
