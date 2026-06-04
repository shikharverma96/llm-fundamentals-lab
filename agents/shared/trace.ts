/**
 * Server-side helpers for emitting agent-trace SSE events.
 * Keeps payload shape aligned with lib/schemas/agent-trace.ts so the
 * static-trace UI components can render live streams without modification.
 */

import type { AgentStep } from '@/lib/schemas/agent-trace';

import { sseEvent } from './sse';

export type StepEmitter = (step: AgentStep) => void;

export interface TraceContext {
  emit: StepEmitter;
  agent: string;
  /** Monotonically increasing step counter — shared across agents in one query. */
  nextStep: () => number;
}

export function buildEmitter(controller: ReadableStreamDefaultController<Uint8Array>): {
  emit: StepEmitter;
  nextStep: () => number;
} {
  let counter = 0;
  return {
    emit: (step) => {
      controller.enqueue(sseEvent('agent_step', step));
    },
    nextStep: () => counter++,
  };
}
