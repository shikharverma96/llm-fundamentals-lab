import { z } from 'zod';

export const RagPipelineStageIdEnum = z.enum([
  'ingest',
  'chunk',
  'embed',
  'index',
  'retrieve',
  'rerank',
  'assemble',
  'generate',
  'confidence',
]);
export type RagPipelineStageId = z.infer<typeof RagPipelineStageIdEnum>;

export const RagPipelineStageSchema = z.object({
  id: RagPipelineStageIdEnum,
  title: z.string().min(1),
  oneLiner: z.string().min(1),
  what: z.string().min(1),
  example: z.string().min(1),
  pitfall: z.string().min(1),
  tools: z.array(z.string().min(1)).min(1),
});
export type RagPipelineStage = z.infer<typeof RagPipelineStageSchema>;

export const RagDoDontItemSchema = z.object({
  title: z.string().min(1),
  reason: z.string().min(1),
});
export type RagDoDontItem = z.infer<typeof RagDoDontItemSchema>;

export const RagPitfallSchema = z.object({
  name: z.string().min(1),
  symptom: z.string().min(1),
  fix: z.string().min(1),
});
export type RagPitfall = z.infer<typeof RagPitfallSchema>;

export const RagChecklistGroupSchema = z.object({
  group: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
});
export type RagChecklistGroup = z.infer<typeof RagChecklistGroupSchema>;

export const RagExamplesFileSchema = z.object({
  query: z.string().min(1),
  sampleDocument: z.string().min(1),
  pipeline: z.array(RagPipelineStageSchema).min(1),
  dos: z.array(RagDoDontItemSchema).min(8),
  donts: z.array(RagDoDontItemSchema).min(8),
  pitfalls: z.array(RagPitfallSchema).min(5),
  checklist: z.array(RagChecklistGroupSchema).min(1),
  mermaid: z.string().min(1),
});
export type RagExamplesFile = z.infer<typeof RagExamplesFileSchema>;
