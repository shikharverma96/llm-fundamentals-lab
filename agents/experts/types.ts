/**
 * Shared expert contract. Every topic expert exports an `Expert` matching this
 * shape so the /api/ask route can dispatch generically by id.
 */

import type { ExpertTool } from '../shared/runner';

export interface Expert {
  id: string;
  /** Static system prompt — rich, opinionated, teaches as it answers. */
  systemPrompt: string;
  tools: ExpertTool[];
}
