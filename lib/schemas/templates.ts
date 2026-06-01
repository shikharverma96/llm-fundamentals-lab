import { z } from 'zod';

export const TemplateIdEnum = z.enum(['chatbot', 'summarizer', 'rag', 'classifier', 'custom']);
export type TemplateId = z.infer<typeof TemplateIdEnum>;

export const CostTemplateSchema = z.object({
  id: TemplateIdEnum,
  label: z.string().min(1),
  description: z.string().min(1),
  inputTokensPerRequest: z.number().int().nonnegative(),
  outputTokensPerRequest: z.number().int().nonnegative(),
  requestsPerDay: z.number().int().nonnegative(),
});
export type CostTemplate = z.infer<typeof CostTemplateSchema>;

export const CostTemplatesFileSchema = z.object({
  templates: z.array(CostTemplateSchema).min(1),
});
export type CostTemplatesFile = z.infer<typeof CostTemplatesFileSchema>;
