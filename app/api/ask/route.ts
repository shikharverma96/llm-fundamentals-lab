import Anthropic from '@anthropic-ai/sdk';
import type { NextRequest } from 'next/server';

import { fallbackExpert, getExpert } from '@/agents/experts';
import { DEFAULTS, MODELS } from '@/agents/shared/models';
import { runToolLoop } from '@/agents/shared/runner';
import { SSE_HEADERS, sseEvent } from '@/agents/shared/sse';
import { buildEmitter } from '@/agents/shared/trace';
import { EXPERT_IDS, type ExpertId, routeToExpert } from '@/agents/supervisor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface AskBody {
  question?: string;
  expert?: string;
  supervisorModel?: string;
  expertModel?: string;
}

function badRequest(message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  const apiKey = req.headers.get('x-anthropic-key')?.trim();
  if (!apiKey || !apiKey.startsWith('sk-ant-')) {
    return badRequest('Missing or malformed Anthropic API key. Send as x-anthropic-key header.');
  }

  let body: AskBody;
  try {
    body = (await req.json()) as AskBody;
  } catch {
    return badRequest('Body must be valid JSON.');
  }
  const question = body.question?.trim();
  if (!question) return badRequest('Field "question" is required.');

  const preselected = body.expert?.trim();
  if (preselected && !EXPERT_IDS.includes(preselected as ExpertId)) {
    return badRequest(`Unknown expert id: ${preselected}`);
  }

  const supervisorModel = body.supervisorModel ?? MODELS.haiku;
  const expertModel = body.expertModel ?? MODELS.sonnet;

  const client = new Anthropic({ apiKey });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const { emit, nextStep } = buildEmitter(controller);
      const startedAt = Date.now();
      const abortController = new AbortController();
      const budgetTimer = setTimeout(() => abortController.abort(), DEFAULTS.perRequestBudgetMs);

      try {
        // 1. Route.
        let expertId: ExpertId;
        let routeReason: string;
        let routeIn = 0;
        let routeOut = 0;

        if (preselected) {
          expertId = preselected as ExpertId;
          routeReason = 'Pre-selected by the user (no supervisor needed).';
          controller.enqueue(
            sseEvent('route', { expert: expertId, reason: routeReason, preselected: true }),
          );
          emit({
            step: nextStep(),
            agent: 'supervisor',
            kind: 'handoff',
            content: `Skipping supervisor — user pre-selected ${expertId}.`,
            tool: { name: expertId },
          });
        } else {
          emit({
            step: nextStep(),
            agent: 'supervisor',
            kind: 'thinking',
            content: 'Classifying the question and selecting the best topic expert…',
          });
          const decision = await routeToExpert(
            client,
            question,
            supervisorModel,
            abortController.signal,
          );
          expertId = decision.expert;
          routeReason = decision.reason;
          routeIn = decision.inputTokens;
          routeOut = decision.outputTokens;
          emit({
            step: nextStep(),
            agent: 'supervisor',
            kind: 'tool_call',
            content: `route_to_expert(expert_id="${expertId}")`,
            tool: { name: 'route_to_expert', args: { expert_id: expertId, reason: routeReason } },
            latencyMs: decision.latencyMs,
            tokens: { input: decision.inputTokens, output: decision.outputTokens },
          });
          emit({
            step: nextStep(),
            agent: 'supervisor',
            kind: 'handoff',
            content: routeReason,
            tool: { name: expertId },
          });
          controller.enqueue(
            sseEvent('route', { expert: expertId, reason: routeReason, preselected: false }),
          );
        }

        // 2. Dispatch.
        const expert = getExpert(expertId) ?? fallbackExpert(expertId);
        const result = await runToolLoop({
          client,
          model: expertModel,
          systemPrompt: expert.systemPrompt,
          userMessage: question,
          tools: expert.tools,
          agentName: expertId,
          emit,
          nextStep,
          abortSignal: abortController.signal,
        });

        controller.enqueue(
          sseEvent('done', {
            expertUsed: expertId,
            stopReason: result.stopReason,
            iterations: result.iterations,
            totalMs: Date.now() - startedAt,
            totalTokens: {
              in: result.totalInputTokens + routeIn,
              out: result.totalOutputTokens + routeOut,
            },
          }),
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(sseEvent('error', { message: msg }));
      } finally {
        clearTimeout(budgetTimer);
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
