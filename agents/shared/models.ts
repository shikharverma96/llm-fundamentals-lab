/**
 * Pinned Anthropic model IDs used by the agentic backend.
 * Centralized so a model bump is a one-line edit.
 */

export const MODELS = {
  /** Cheap router. Used by the supervisor. */
  haiku: 'claude-haiku-4-5-20251001',
  /** Reasoning workhorse. Used by every topic expert. */
  sonnet: 'claude-sonnet-4-5',
  /** High-reasoning fallback. Not wired by default — opt-in via settings. */
  opus: 'claude-opus-4-6',
} as const;

export type ModelId = (typeof MODELS)[keyof typeof MODELS];

export const DEFAULTS = {
  supervisorModel: MODELS.haiku,
  expertModel: MODELS.sonnet,
  maxIter: 8,
  /** Per-step token cap for tool_result truncation. */
  toolResultMaxChars: 6000,
  /** Server-side wall clock budget per query (ms). Vercel hobby = 60s. */
  perRequestBudgetMs: 55_000,
} as const;
