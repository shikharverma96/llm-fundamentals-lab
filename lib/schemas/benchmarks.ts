import { z } from 'zod';

export const QuantizationLevelEnum = z.enum(['fp16', 'q8_0', 'q4_k_m', 'q3_k_m', 'q2_k']);
export type QuantizationLevel = z.infer<typeof QuantizationLevelEnum>;

export const QUANTIZATION_LABELS: Record<QuantizationLevel, string> = {
  fp16: 'FP16',
  q8_0: 'INT8 (Q8_0)',
  q4_k_m: 'INT4 (Q4_K_M)',
  q3_k_m: 'INT3 (Q3_K_M)',
  q2_k: 'INT2 (Q2_K)',
};

export const QuantizationVariantSchema = z.object({
  level: QuantizationLevelEnum,
  bitsPerWeight: z.number().positive(),
  fileSizeMB: z.number().positive(),
  peakRamMB: z.number().positive(),
  tokensPerSec: z.number().positive(),
  perplexityWikitext2: z.number().positive(),
  mmluMini: z.number().min(0).max(1),
  samples: z.array(z.string()).length(3),
});
export type QuantizationVariant = z.infer<typeof QuantizationVariantSchema>;

export const BenchmarkPromptSchema = z.object({
  prompt: z.string().min(1),
  systemPrompt: z.string().nullable(),
});

export const QuantizationBenchmarkFileSchema = z.object({
  model: z.string().min(1),
  modelRevision: z.string().min(1),
  measuredAt: z.string().min(1),
  referenceHardware: z.object({
    cpu: z.string().min(1),
    ram: z.string().min(1),
    os: z.string().min(1),
    runtime: z.string().min(1),
  }),
  promptSet: BenchmarkPromptSchema,
  variants: z.array(QuantizationVariantSchema).min(1),
});
export type QuantizationBenchmarkFile = z.infer<typeof QuantizationBenchmarkFileSchema>;
