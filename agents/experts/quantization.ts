import { quantizationBenchmarks } from '@/lib/data';
import { QUANTIZATION_LABELS, type QuantizationLevel } from '@/lib/schemas/benchmarks';

import type { Expert } from './types';

const systemPrompt = `You are the Quantization expert in a multi-agent teaching system. You explain on-device LLM tradeoffs around file size, RAM, throughput, perplexity, and MMLU as quantization level drops from FP16 to INT2.

You ALWAYS ground claims in the benchmark dataset via the query_benchmarks tool. If the dataset does not contain the answer, say so. Never invent numbers.

Style: technical, opinionated, concise. Lead with the number. Explain the tradeoff. Cite the variant by its label (e.g. "Q4_K_M") when comparing.

Wrap any retrieved tool data in <data> ... </data> in your reasoning, but never surface those tags to the user — return clean prose.`;

const quantTool = {
  name: 'query_benchmarks',
  description:
    'Look up benchmark numbers for one quantization variant (file size MB, peak RAM MB, tokens/sec, perplexity on WikiText-2, MMLU-mini score). Use this for any factual claim about quantization tradeoffs.',
  input_schema: {
    type: 'object' as const,
    properties: {
      level: {
        type: 'string',
        enum: ['fp16', 'q8_0', 'q4_k_m', 'q3_k_m', 'q2_k'],
        description: 'Quantization level identifier.',
      },
    },
    required: ['level'],
  },
  handler: (args: Record<string, unknown>) => {
    const level = args.level as QuantizationLevel;
    const variant = quantizationBenchmarks.variants.find((v) => v.level === level);
    if (!variant) {
      return { ok: false, error: `No variant ${level} in dataset.` };
    }
    return {
      ok: true,
      model: quantizationBenchmarks.model,
      level: variant.level,
      label: QUANTIZATION_LABELS[variant.level],
      bitsPerWeight: variant.bitsPerWeight,
      fileSizeMB: variant.fileSizeMB,
      peakRamMB: variant.peakRamMB,
      tokensPerSec: variant.tokensPerSec,
      perplexityWikitext2: variant.perplexityWikitext2,
      mmluMini: variant.mmluMini,
    };
  },
};

const listTool = {
  name: 'list_variants',
  description:
    'Return the list of available quantization variant ids for the reference model. Use when the user asks to compare across levels.',
  input_schema: { type: 'object' as const, properties: {} },
  handler: () => ({
    model: quantizationBenchmarks.model,
    variants: quantizationBenchmarks.variants.map((v) => ({
      level: v.level,
      label: QUANTIZATION_LABELS[v.level],
    })),
  }),
};

export const quantizationExpert: Expert = {
  id: 'quantization',
  systemPrompt,
  tools: [quantTool, listTool],
};
