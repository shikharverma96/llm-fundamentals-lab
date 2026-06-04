/**
 * Generic Anthropic tool-use loop runner. Emits AgentStep events for every
 * model turn (thinking text, tool call, tool result, final answer) so the
 * /ask trace UI can render them in real time.
 *
 * Single-file, framework-free. Used by both the supervisor and each expert.
 */

import type Anthropic from '@anthropic-ai/sdk';

import type { AgentStep } from '@/lib/schemas/agent-trace';

import { DEFAULTS } from './models';
import type { StepEmitter } from './trace';

export interface ExpertTool {
  name: string;
  description: string;
  input_schema: Anthropic.Tool.InputSchema;
  /** Returns whatever the model should see as the tool_result. */
  handler: (args: Record<string, unknown>) => Promise<unknown> | unknown;
}

export interface RunOptions {
  client: Anthropic;
  /** Model id — accepts any string so route handler can pass user overrides. */
  model: string;
  systemPrompt: string;
  userMessage: string;
  tools: ExpertTool[];
  agentName: string;
  emit: StepEmitter;
  nextStep: () => number;
  maxIter?: number;
  abortSignal?: AbortSignal;
}

export interface RunResult {
  finalText: string;
  totalInputTokens: number;
  totalOutputTokens: number;
  iterations: number;
  stopReason: 'end_turn' | 'max_iter' | 'aborted' | 'error';
}

export async function runToolLoop(opts: RunOptions): Promise<RunResult> {
  const {
    client,
    model,
    systemPrompt,
    userMessage,
    tools,
    agentName,
    emit,
    nextStep,
    maxIter = DEFAULTS.maxIter,
    abortSignal,
  } = opts;

  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: userMessage }];
  const toolDefs: Anthropic.Tool[] = tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.input_schema,
  }));

  let totalIn = 0;
  let totalOut = 0;
  let iterations = 0;
  let finalText = '';

  for (let i = 0; i < maxIter; i++) {
    iterations = i + 1;
    if (abortSignal?.aborted) {
      return {
        finalText,
        totalInputTokens: totalIn,
        totalOutputTokens: totalOut,
        iterations,
        stopReason: 'aborted',
      };
    }

    const t0 = Date.now();
    const res = await client.messages.create(
      {
        model,
        max_tokens: 2048,
        system: systemPrompt,
        tools: toolDefs.length > 0 ? toolDefs : undefined,
        messages,
      },
      abortSignal ? { signal: abortSignal } : undefined,
    );
    const latency = Date.now() - t0;
    totalIn += res.usage.input_tokens;
    totalOut += res.usage.output_tokens;

    // Record assistant turn to preserve history.
    messages.push({ role: 'assistant', content: res.content });

    // Surface any text blocks as a 'thinking' or 'text' step.
    const textBlocks = res.content.filter((b): b is Anthropic.TextBlock => b.type === 'text');
    for (const tb of textBlocks) {
      if (!tb.text.trim()) continue;
      const step: AgentStep = {
        step: nextStep(),
        agent: agentName,
        kind: res.stop_reason === 'end_turn' ? 'text' : 'thinking',
        content: tb.text,
        latencyMs: latency,
        tokens: { input: res.usage.input_tokens, output: res.usage.output_tokens },
      };
      emit(step);
    }

    if (res.stop_reason === 'end_turn') {
      finalText = textBlocks.map((b) => b.text).join('');
      const finalStep: AgentStep = {
        step: nextStep(),
        agent: agentName,
        kind: 'final',
        content: finalText,
      };
      emit(finalStep);
      return {
        finalText,
        totalInputTokens: totalIn,
        totalOutputTokens: totalOut,
        iterations,
        stopReason: 'end_turn',
      };
    }

    const toolUses = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
    if (toolUses.length === 0) {
      // No tool, no end_turn — odd. Treat as final.
      const fallback = textBlocks.map((b) => b.text).join('') || '(no output)';
      finalText = fallback;
      emit({ step: nextStep(), agent: agentName, kind: 'final', content: fallback });
      return {
        finalText,
        totalInputTokens: totalIn,
        totalOutputTokens: totalOut,
        iterations,
        stopReason: 'end_turn',
      };
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const tu of toolUses) {
      emit({
        step: nextStep(),
        agent: agentName,
        kind: 'tool_call',
        content: `${tu.name}(${JSON.stringify(tu.input ?? {})})`,
        tool: { name: tu.name, args: (tu.input ?? {}) as Record<string, unknown> },
      });

      const tool = tools.find((t) => t.name === tu.name);
      if (!tool) {
        const errMsg = `Unknown tool: ${tu.name}`;
        emit({
          step: nextStep(),
          agent: agentName,
          kind: 'error',
          content: errMsg,
          tool: { name: tu.name, result: { ok: false, error: errMsg } },
        });
        toolResults.push({
          type: 'tool_result',
          tool_use_id: tu.id,
          is_error: true,
          content: errMsg,
        });
        continue;
      }

      try {
        const out = await tool.handler((tu.input ?? {}) as Record<string, unknown>);
        const serialized = JSON.stringify(out).slice(0, DEFAULTS.toolResultMaxChars);
        emit({
          step: nextStep(),
          agent: agentName,
          kind: 'tool_result',
          content: serialized,
          tool: { name: tu.name, result: out },
        });
        toolResults.push({
          type: 'tool_result',
          tool_use_id: tu.id,
          content: serialized,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        emit({
          step: nextStep(),
          agent: agentName,
          kind: 'error',
          content: msg,
          tool: { name: tu.name, result: { ok: false, error: msg } },
        });
        toolResults.push({
          type: 'tool_result',
          tool_use_id: tu.id,
          is_error: true,
          content: msg,
        });
      }
    }

    messages.push({ role: 'user', content: toolResults });
  }

  emit({
    step: nextStep(),
    agent: agentName,
    kind: 'error',
    content: `Max iterations (${maxIter}) reached without final answer.`,
  });
  return {
    finalText,
    totalInputTokens: totalIn,
    totalOutputTokens: totalOut,
    iterations,
    stopReason: 'max_iter',
  };
}
