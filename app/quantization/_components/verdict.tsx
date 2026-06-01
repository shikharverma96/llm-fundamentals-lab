'use client';

import { QUANTIZATION_LABELS, type QuantizationVariant } from '@/lib/schemas/benchmarks';

interface Props {
  baseline: QuantizationVariant;
  selected: QuantizationVariant;
}

function verdictFor(selected: QuantizationVariant, baseline: QuantizationVariant): {
  headline: string;
  body: string;
  recommendation: string;
} {
  const sizePct = (1 - selected.fileSizeMB / baseline.fileSizeMB) * 100;
  const qualityDropPct = ((baseline.mmluMini - selected.mmluMini) / baseline.mmluMini) * 100;
  const pplJump = ((selected.perplexityWikitext2 - baseline.perplexityWikitext2) /
    baseline.perplexityWikitext2) *
    100;

  if (selected.level === 'fp16') {
    return {
      headline: 'Reference precision.',
      body: 'No quality loss — this is the baseline every other level is judged against.',
      recommendation: 'Use when memory is plentiful and accuracy must be untouched.',
    };
  }

  if (selected.level === 'q8_0') {
    return {
      headline: `${Math.round(sizePct)}% smaller, quality basically untouched.`,
      body: `Perplexity moves only ~${pplJump.toFixed(1)}%, MMLU within ~${qualityDropPct.toFixed(1)}%. Free wins.`,
      recommendation: 'Use this by default. Almost no reason to ship FP16 to laptops or edge devices.',
    };
  }

  if (selected.level === 'q4_k_m') {
    return {
      headline: `${Math.round(sizePct)}% smaller and ~${(
        (selected.tokensPerSec / baseline.tokensPerSec - 1) *
        100
      ).toFixed(0)}% faster.`,
      body: `MMLU drops ~${qualityDropPct.toFixed(1)}% and perplexity rises ~${pplJump.toFixed(1)}%. Most users will not notice.`,
      recommendation:
        'The sweet spot for on-device. Recommended for production unless you measure a regression on your specific eval.',
    };
  }

  if (selected.level === 'q3_k_m') {
    return {
      headline: 'Edge of the quality cliff.',
      body: `Size keeps shrinking but perplexity is up ~${pplJump.toFixed(1)}% and MMLU is down ~${qualityDropPct.toFixed(1)}%. Reasoning prompts begin to suffer.`,
      recommendation: 'Use only when RAM is the dominant constraint. Test on your real prompts.',
    };
  }

  return {
    headline: 'Smallest, but answers degrade.',
    body: `${Math.round(sizePct)}% smaller than FP16, but MMLU is down ~${qualityDropPct.toFixed(
      1,
    )}% and perplexity is up ~${pplJump.toFixed(1)}%. Outputs become noticeably shorter and less coherent.`,
    recommendation: 'Reserve for memory-starved devices and simple tasks. Treat outputs with caution.',
  };
}

export function Verdict({ baseline, selected }: Props): React.ReactElement {
  const v = verdictFor(selected, baseline);
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <p className="text-base font-semibold">
        {QUANTIZATION_LABELS[selected.level]} — {v.headline}
      </p>
      <p className="text-muted-foreground">{v.body}</p>
      <div className="rounded-md border-l-2 border-primary bg-primary/5 p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Recommendation</p>
        <p className="mt-1">{v.recommendation}</p>
      </div>
    </div>
  );
}
