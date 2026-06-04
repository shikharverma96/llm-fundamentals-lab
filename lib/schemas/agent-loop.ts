import { z } from 'zod';

import { AgentTraceSchema } from './agent-trace';

export const AgentLoopGotchaSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  symptom: z.string().min(1),
  fix: z.string().min(1),
});
export type AgentLoopGotcha = z.infer<typeof AgentLoopGotchaSchema>;

export const AgentLoopExamplesFileSchema = z.object({
  /** A worked, mocked trace for a single-agent loop. */
  trace: AgentTraceSchema,
  /** Common failure modes with concrete fixes. */
  gotchas: z.array(AgentLoopGotchaSchema).min(5),
});
export type AgentLoopExamplesFile = z.infer<typeof AgentLoopExamplesFileSchema>;
