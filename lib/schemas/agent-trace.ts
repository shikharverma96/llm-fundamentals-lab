import { z } from 'zod';

/**
 * Generic mocked-agent-trace types. Used by:
 *   - Module F (agent-loop) — single-agent stepper
 *   - Module K (planning)   — same task across strategies
 *   - Module L (multi-agent) — multi-agent message-passing
 *
 * Same shape used at runtime by the live SSE stream from /api/ask
 * (see agents/shared/trace.ts) so the UI components are reusable.
 */

export const AgentStepKindEnum = z.enum([
  'thinking',
  'tool_call',
  'tool_result',
  'text',
  'handoff',
  'error',
  'final',
]);
export type AgentStepKind = z.infer<typeof AgentStepKindEnum>;

export const AgentStepSchema = z.object({
  step: z.number().int().nonnegative(),
  agent: z.string().min(1),
  kind: AgentStepKindEnum,
  /**
   * Free-text payload (thinking text, model output, error message)
   * OR a stringified JSON for tool_call/tool_result kinds.
   * Keeping it as a single string keeps the schema flat and the UI generic.
   */
  content: z.string(),
  /**
   * Optional structured payload — present for tool_call/tool_result/handoff.
   * `name` is tool name or target-agent for handoff. `args` is the JSON object.
   */
  tool: z
    .object({
      name: z.string().min(1),
      args: z.record(z.unknown()).optional(),
      result: z.unknown().optional(),
    })
    .optional(),
  /** Optional latency for this step in milliseconds. */
  latencyMs: z.number().nonnegative().optional(),
  /** Optional token counts for this step. */
  tokens: z
    .object({
      input: z.number().int().nonnegative(),
      output: z.number().int().nonnegative(),
    })
    .optional(),
});
export type AgentStep = z.infer<typeof AgentStepSchema>;

export const AgentTraceSchema = z.object({
  title: z.string().min(1),
  task: z.string().min(1),
  steps: z.array(AgentStepSchema).min(1),
  /** Final answer surfaced to the user, if any. */
  finalAnswer: z.string().optional(),
  /** Aggregate stats for the trace. */
  totals: z
    .object({
      steps: z.number().int().nonnegative(),
      tokensIn: z.number().int().nonnegative(),
      tokensOut: z.number().int().nonnegative(),
      latencyMs: z.number().nonnegative(),
    })
    .optional(),
});
export type AgentTrace = z.infer<typeof AgentTraceSchema>;
