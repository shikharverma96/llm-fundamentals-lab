import type { ExpertId } from '../supervisor';
import { quantizationExpert } from './quantization';
import type { Expert } from './types';

const REGISTRY: Partial<Record<ExpertId, Expert>> = {
  quantization: quantizationExpert,
};

/** Look up an expert by id. Returns undefined for ids not yet wired. */
export function getExpert(id: ExpertId): Expert | undefined {
  return REGISTRY[id];
}

/** Fallback expert used when no specialist is wired for an id. */
export function fallbackExpert(id: ExpertId): Expert {
  return {
    id,
    systemPrompt: `You are a placeholder expert standing in for the "${id}" specialist (not yet wired into the live system). Answer the user concisely using your general LLM/Agentic-AI knowledge. Lead with "(placeholder expert — full specialist coming soon.)" so the user knows.`,
    tools: [],
  };
}

export { quantizationExpert };
