import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Cause {
  id: string;
  title: string;
  what: string;
  consequence: string;
}

const CAUSES: Cause[] = [
  {
    id: 'objective',
    title: 'Training objective rewards plausibility, not truth',
    what: 'Next-token prediction is a maximum-likelihood game. The loss function asks "what word usually comes next here?" — never "is this true?". Fluent continuations are reinforced even when they invent facts that simply pattern-match the training distribution.',
    consequence:
      'A model fine-tuned to be helpful and confident has been gradient-descent-pushed away from saying "I do not know". Hallucination is the loss function working exactly as designed.',
  },
  {
    id: 'parametric',
    title: 'Parametric memory is fuzzy, compressed, and stale',
    what: 'Facts the model knows are baked into ~10⁹–10¹² weights as overlapping distributed representations. Two facts about Apple Inc. share parameters with two facts about apples the fruit. Retrieval at inference time is lossy interpolation, not lookup.',
    consequence:
      'Recall degrades for any fact rare in the training corpus, recent (post-cutoff), or close in embedding space to similar-but-different facts. Citations, dates, version numbers, court case names — all classic offenders.',
  },
  {
    id: 'context',
    title: 'Long context dilutes attention',
    what: 'Attention computes weighted sums across the whole context. With 100k tokens of source material, the per-token weight on any specific fact is tiny. Empirically — "lost in the middle" — models attend strongly to the start and end, weakly to the middle.',
    consequence:
      'Stuffing 50 retrieved chunks into a prompt makes things worse, not better. Better to rerank to 3–5 high-relevance chunks than to dump the top-50.',
  },
  {
    id: 'decoding',
    title: 'Sampling explores the tail of the distribution',
    what: 'At temperature > 0 the model picks tokens proportional to softmax probabilities. The "correct" token may be the 5th most likely, behind four plausible-but-wrong neighbours. Sampling will sometimes choose one of them.',
    consequence:
      'Higher temperature ⇒ more diversity ⇒ more hallucinations. Top-p cuts the worst tail (probability mass), top-k cuts by rank. Neither eliminates the issue; they shape the risk curve.',
  },
  {
    id: 'rlhf',
    title: 'RLHF teaches confident prose over calibrated prose',
    what: 'Preference data raters often penalise "I am not sure" replies as unhelpful, and reward fluent, definite, well-structured answers. The reward model learns confidence as a feature; the policy network optimises for it.',
    consequence:
      'Post-RLHF models hallucinate with the same prosodic confidence as their correct answers. The verbal cue "I think" or "approximately" gets trained away — calibration loss is a real, measurable artifact.',
  },
];

export function WhyItHappens(): React.ReactElement {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {CAUSES.map((c) => (
        <Card key={c.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{c.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Mechanism: </span>
              <span className="text-muted-foreground">{c.what}</span>
            </p>
            <p>
              <span className="font-medium">Consequence: </span>
              <span className="text-muted-foreground">{c.consequence}</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
