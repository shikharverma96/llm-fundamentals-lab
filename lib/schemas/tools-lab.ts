import { z } from 'zod';

export const ToolExampleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  schema: z.record(z.unknown()),
  verdict: z.enum(['good', 'bad']),
  rationale: z.string().min(1),
});
export type ToolExample = z.infer<typeof ToolExampleSchema>;

export const ToolsLabFileSchema = z.object({
  examples: z.array(ToolExampleSchema).min(4),
  pitfalls: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        body: z.string().min(1),
      }),
    )
    .min(5),
});
export type ToolsLabFile = z.infer<typeof ToolsLabFileSchema>;
