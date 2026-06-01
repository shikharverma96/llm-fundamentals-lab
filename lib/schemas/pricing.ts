import { z } from 'zod';

export const PrivacyLevelEnum = z.enum(['cloud', 'private-cloud', 'on-device']);
export type PrivacyLevel = z.infer<typeof PrivacyLevelEnum>;

export const PRIVACY_LABELS: Record<PrivacyLevel, string> = {
  cloud: 'Cloud',
  'private-cloud': 'Private cloud',
  'on-device': 'On-device',
};

export const ProviderEnum = z.enum([
  'openai',
  'anthropic',
  'google',
  'groq',
  'together',
  'on-device',
]);
export type ProviderId = z.infer<typeof ProviderEnum>;

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  groq: 'Groq',
  together: 'Together AI',
  'on-device': 'On-device',
};

/**
 * Tokenizer family used when projecting cost for a given input text.
 * Maps a model row in the comparison matrix to one of the tokenizers
 * the playground supports (see lib/tokenizer.ts).
 */
export const TokenizerFamilyEnum = z.enum([
  'o200k_base',
  'cl100k_base',
  'llama3',
  'mistral',
  'gemma',
]);
export type TokenizerFamily = z.infer<typeof TokenizerFamilyEnum>;

export const ProviderModelSchema = z.object({
  id: z.string().min(1),
  provider: ProviderEnum,
  modelLabel: z.string().min(1),
  inputPricePer1M: z.number().min(0),
  outputPricePer1M: z.number().min(0),
  p50LatencyMs: z.number().positive(),
  privacy: PrivacyLevelEnum,
  contextWindow: z.number().int().positive(),
  tokenizer: TokenizerFamilyEnum,
  notes: z.string().optional(),
});
export type ProviderModel = z.infer<typeof ProviderModelSchema>;

export const ProviderPricingFileSchema = z.object({
  lastUpdated: z.string().min(1),
  source: z.string().min(1),
  currency: z.literal('USD'),
  models: z.array(ProviderModelSchema).min(1),
});
export type ProviderPricingFile = z.infer<typeof ProviderPricingFileSchema>;
