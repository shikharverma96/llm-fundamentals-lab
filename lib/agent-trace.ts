import type { AgentStep, AgentTrace } from '@/lib/schemas/agent-trace';

/**
 * Pure helpers for stepping through an agent trace (mocked or live).
 * No React, no IO — safe in server and client components.
 */

export function totals(trace: AgentTrace): {
  steps: number;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
} {
  if (trace.totals) return trace.totals;
  return trace.steps.reduce(
    (acc, s) => ({
      steps: acc.steps + 1,
      tokensIn: acc.tokensIn + (s.tokens?.input ?? 0),
      tokensOut: acc.tokensOut + (s.tokens?.output ?? 0),
      latencyMs: acc.latencyMs + (s.latencyMs ?? 0),
    }),
    { steps: 0, tokensIn: 0, tokensOut: 0, latencyMs: 0 },
  );
}

export function stepLabel(step: AgentStep): string {
  switch (step.kind) {
    case 'thinking':
      return 'Thinking';
    case 'tool_call':
      return `Tool · ${step.tool?.name ?? 'unknown'}`;
    case 'tool_result':
      return `Result · ${step.tool?.name ?? 'unknown'}`;
    case 'text':
      return 'Text output';
    case 'handoff':
      return `Hand-off → ${step.tool?.name ?? 'unknown'}`;
    case 'error':
      return 'Error';
    case 'final':
      return 'Final answer';
    default:
      return step.kind;
  }
}

export function stepToneClass(kind: AgentStep['kind']): string {
  switch (kind) {
    case 'thinking':
      return 'border-sky-300 bg-sky-50 dark:border-sky-700 dark:bg-sky-950/60';
    case 'tool_call':
      return 'border-violet-300 bg-violet-50 dark:border-violet-700 dark:bg-violet-950/60';
    case 'tool_result':
      return 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/60';
    case 'text':
      return 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/60';
    case 'handoff':
      return 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/60';
    case 'error':
      return 'border-rose-400 bg-rose-50 dark:border-rose-700 dark:bg-rose-950/60';
    case 'final':
      return 'border-primary bg-primary/5';
    default:
      return 'border-muted bg-muted/40';
  }
}

/**
 * Truncate a content string for compact display in the trace list.
 * Keeps leading and trailing context; replaces middle with `…`.
 */
export function truncateForList(s: string, max = 140): string {
  if (s.length <= max) return s;
  const head = Math.ceil((max - 1) / 2);
  const tail = Math.floor((max - 1) / 2);
  return `${s.slice(0, head)}…${s.slice(s.length - tail)}`;
}

/**
 * Format tool args/results for display. JSON-pretty if it parses, else raw.
 */
export function formatToolPayload(payload: unknown): string {
  if (payload === undefined || payload === null) return '';
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
}
