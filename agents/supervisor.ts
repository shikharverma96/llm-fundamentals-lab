/**
 * Supervisor agent. One tool — route_to_expert — picks the topic expert.
 * Cheap model (Haiku 4.5). System prompt enumerates each expert in one line.
 *
 * Returns the expert id + the reasoning so the UI can render "why this one".
 */

import type Anthropic from '@anthropic-ai/sdk';

export const EXPERTS = [
  { id: 'quantization', blurb: 'on-device LLM size, RAM, throughput, perplexity tradeoffs' },
  { id: 'tokenizer', blurb: 'token splitting, vocab differences, multilingual cost' },
  { id: 'cost', blurb: 'API cost math, provider comparison, monthly projections' },
  { id: 'hallucination', blurb: 'why LLMs make things up, taxonomy, mitigations' },
  { id: 'rag', blurb: 'retrieval pipelines, chunking, reranking, citations' },
  { id: 'agent-loop', blurb: 'think-act-observe cycle, stop conditions, parse failures' },
  { id: 'tools', blurb: 'tool/function design, schemas, ambiguity, idempotency' },
  { id: 'patterns', blurb: 'Anthropic agent patterns: routing, chaining, orchestrator-worker' },
  { id: 'memory', blurb: 'scratchpad / working / episodic / semantic / procedural memory' },
  { id: 'guardrails', blurb: 'prompt injection defenses, output validation, sandboxing' },
  { id: 'multi-agent', blurb: 'supervisor/swarm/pipeline/debate topologies, hand-offs' },
  { id: 'planning', blurb: 'ReAct, Plan-and-Execute, Reflexion, Tree-of-Thoughts' },
  { id: 'evals', blurb: 'agent evals, trajectory quality, LLM-as-judge, observability' },
  { id: 'mcp', blurb: 'Model Context Protocol, JSON-RPC transport, capability negotiation' },
  { id: 'frameworks', blurb: 'Claude Agent SDK, LangGraph, AutoGen, CrewAI tradeoffs' },
  { id: 'computer-use', blurb: 'vision-grounded vs DOM-grounded browser/desktop control' },
  { id: 'context', blurb: 'context-window engineering, compaction, cache breakpoints' },
  { id: 'structured-output', blurb: 'JSON mode, tool-as-extractor, schema-constrained decoding' },
  { id: 'caching', blurb: 'prompt caching strategy, breakpoint placement, savings math' },
  { id: 'failure-modes', blurb: 'agent failure taxonomy: loops, hallucinated tools, goal drift' },
] as const;

export type ExpertId = (typeof EXPERTS)[number]['id'];
export const EXPERT_IDS = EXPERTS.map((e) => e.id) as readonly ExpertId[];

function expertCatalog(): string {
  return EXPERTS.map((e) => `- ${e.id}: ${e.blurb}`).join('\n');
}

export function supervisorSystemPrompt(): string {
  return `You are a routing supervisor for a multi-agent system that teaches LLM and Agentic AI fundamentals.

You will receive a user question. Choose exactly one expert from the catalog below to handle it, using the route_to_expert tool. Explain your reasoning in 1–2 sentences.

If the question doesn't clearly match any expert, pick the closest one and say so in the reasoning. Never answer the question yourself — always route.

Experts:
${expertCatalog()}`;
}

export interface RouteDecision {
  expert: ExpertId;
  reason: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

const ROUTE_TOOL: Anthropic.Tool = {
  name: 'route_to_expert',
  description: 'Pick the single best expert to handle the user question.',
  input_schema: {
    type: 'object',
    properties: {
      expert_id: {
        type: 'string',
        enum: EXPERT_IDS as unknown as string[],
        description: 'Identifier of the chosen expert.',
      },
      reason: {
        type: 'string',
        description: 'One or two sentences explaining the choice.',
      },
    },
    required: ['expert_id', 'reason'],
  },
};

export async function routeToExpert(
  client: Anthropic,
  userQuestion: string,
  model: string,
  abortSignal?: AbortSignal,
): Promise<RouteDecision> {
  const t0 = Date.now();
  const res = await client.messages.create(
    {
      model,
      max_tokens: 512,
      system: supervisorSystemPrompt(),
      tools: [ROUTE_TOOL],
      tool_choice: { type: 'tool', name: 'route_to_expert' },
      messages: [{ role: 'user', content: userQuestion }],
    },
    abortSignal ? { signal: abortSignal } : undefined,
  );
  const latency = Date.now() - t0;

  const toolUse = res.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use' && b.name === 'route_to_expert',
  );
  if (!toolUse) {
    throw new Error('Supervisor did not produce a routing decision.');
  }
  const input = toolUse.input as { expert_id: string; reason: string };
  if (!EXPERT_IDS.includes(input.expert_id as ExpertId)) {
    throw new Error(`Supervisor returned unknown expert: ${input.expert_id}`);
  }
  return {
    expert: input.expert_id as ExpertId,
    reason: input.reason,
    inputTokens: res.usage.input_tokens,
    outputTokens: res.usage.output_tokens,
    latencyMs: latency,
  };
}
