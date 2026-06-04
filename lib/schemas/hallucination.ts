import { z } from 'zod';

export const HallucinationTypeEnum = z.enum(['intrinsic', 'extrinsic', 'factual', 'reasoning']);
export type HallucinationType = z.infer<typeof HallucinationTypeEnum>;

export const HALLUCINATION_TYPE_LABELS: Record<HallucinationType, string> = {
  intrinsic: 'Intrinsic',
  extrinsic: 'Extrinsic',
  factual: 'Factual',
  reasoning: 'Reasoning',
};

export const HALLUCINATION_TYPE_BLURBS: Record<HallucinationType, string> = {
  intrinsic: 'Contradicts the input or supplied context.',
  extrinsic:
    'Adds information not derivable from the context — fabricated dates, quotes, citations.',
  factual: 'Contradicts well-established, verifiable facts about the world.',
  reasoning: 'Facts are individually correct, but the inference chain is broken.',
};

export const TaxonomyExampleSchema = z.object({
  type: HallucinationTypeEnum,
  title: z.string().min(1),
  context: z.string().nullable(),
  prompt: z.string().min(1),
  modelOutput: z.string().min(1),
  whyItsWrong: z.string().min(1),
  giveaway: z.string().min(1),
});
export type TaxonomyExample = z.infer<typeof TaxonomyExampleSchema>;

export const TemperatureSampleSchema = z.object({
  temperature: z.number().min(0).max(2),
  label: z.string().min(1),
  output: z.string().min(1),
  annotation: z.string().min(1),
  hallucinationRisk: z.enum(['low', 'medium', 'high']),
});
export type TemperatureSample = z.infer<typeof TemperatureSampleSchema>;

export const TemperatureDemoSchema = z.object({
  prompt: z.string().min(1),
  systemPrompt: z.string().nullable(),
  samples: z.array(TemperatureSampleSchema).length(3),
});
export type TemperatureDemo = z.infer<typeof TemperatureDemoSchema>;

export const PromptPairSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  bad: z.object({
    prompt: z.string().min(1),
    likelyOutput: z.string().min(1),
    problem: z.string().min(1),
  }),
  good: z.object({
    prompt: z.string().min(1),
    likelyOutput: z.string().min(1),
    why: z.string().min(1),
  }),
});
export type PromptPair = z.infer<typeof PromptPairSchema>;

export const HallucinationExamplesFileSchema = z.object({
  taxonomy: z.array(TaxonomyExampleSchema).min(4),
  temperatureDemo: TemperatureDemoSchema,
  promptPairs: z.array(PromptPairSchema).min(3),
});
export type HallucinationExamplesFile = z.infer<typeof HallucinationExamplesFileSchema>;
