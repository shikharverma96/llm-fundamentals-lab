import { z } from 'zod';

/**
 * Shared shape for "concept" modules: a list of patterns/items + pitfalls + an
 * artifact (TS code skeleton or prompt). Used by all reference-only modules in
 * the Agentic AI curriculum so they share a tight, consistent data shape.
 */

export const ConceptItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  /** When to reach for this pattern / what it is. */
  whenToUse: z.string().min(1),
  /** Concrete worked example or mechanism description. */
  mechanism: z.string().min(1),
  /** Trade-offs / cost / latency / robustness. */
  tradeoff: z.string().min(1),
});
export type ConceptItem = z.infer<typeof ConceptItemSchema>;

export const ConceptPitfallSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
});
export type ConceptPitfall = z.infer<typeof ConceptPitfallSchema>;

export const ConceptArtifactSchema = z.object({
  kind: z.enum(['code', 'prompt']),
  language: z.string().min(1),
  /** The artifact body — TS code or a prompt string. */
  content: z.string().min(1),
});
export type ConceptArtifact = z.infer<typeof ConceptArtifactSchema>;

export const ConceptModuleFileSchema = z.object({
  moduleId: z.string().min(1),
  moduleLabel: z.string().min(1),
  intro: z.string().min(1),
  items: z.array(ConceptItemSchema).min(3),
  pitfalls: z.array(ConceptPitfallSchema).min(3),
  artifact: ConceptArtifactSchema,
});
export type ConceptModuleFile = z.infer<typeof ConceptModuleFileSchema>;
