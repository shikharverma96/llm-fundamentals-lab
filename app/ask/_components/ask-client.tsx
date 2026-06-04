'use client';

import { useCallback, useEffect, useState } from 'react';

import { getApiKey } from '@/lib/api-key';
import type { AgentStep } from '@/lib/schemas/agent-trace';

import { KeySettings } from './key-settings';
import { parseChunk, type SseEvent } from './sse-parser';
import { TracePanel } from './trace-panel';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  expert?: string;
}

interface DoneInfo {
  expertUsed: string;
  stopReason: string;
  iterations: number;
  totalMs: number;
  totalTokens: { in: number; out: number };
}

interface AskClientProps {
  initialExpert?: string;
}

export function AskClient({ initialExpert }: AskClientProps): React.ReactElement {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [route, setRoute] = useState<{
    expert: string;
    reason: string;
    preselected: boolean;
  } | null>(null);
  const [done, setDone] = useState<DoneInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [expert, setExpert] = useState<string>(initialExpert ?? '');

  useEffect(() => {
    setHasKey(Boolean(getApiKey()));
  }, []);

  const handleEvent = useCallback((ev: SseEvent) => {
    if (ev.event === 'route') {
      try {
        const payload = JSON.parse(ev.data) as {
          expert: string;
          reason: string;
          preselected: boolean;
        };
        setRoute(payload);
      } catch {
        // ignore parse errors
      }
      return;
    }
    if (ev.event === 'agent_step') {
      try {
        const step = JSON.parse(ev.data) as AgentStep;
        setSteps((prev) => [...prev, step]);
        if (step.kind === 'final') {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', text: step.content, expert: step.agent },
          ]);
        }
      } catch {
        // ignore
      }
      return;
    }
    if (ev.event === 'done') {
      try {
        setDone(JSON.parse(ev.data) as DoneInfo);
      } catch {
        // ignore
      }
      return;
    }
    if (ev.event === 'error') {
      try {
        const { message } = JSON.parse(ev.data) as { message: string };
        setError(message);
      } catch {
        setError(ev.data);
      }
    }
  }, []);

  async function submit(): Promise<void> {
    const q = question.trim();
    if (!q || running) return;
    const apiKey = getApiKey();
    if (!apiKey) {
      setError('No API key set. Add one in the panel above.');
      return;
    }
    setError(null);
    setSteps([]);
    setRoute(null);
    setDone(null);
    setRunning(true);
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setQuestion('');

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-anthropic-key': apiKey,
        },
        body: JSON.stringify({ question: q, expert: expert || undefined }),
      });

      if (!res.ok || !res.body) {
        const txt = await res.text();
        try {
          const parsed = JSON.parse(txt) as { error?: string };
          setError(parsed.error ?? txt);
        } catch {
          setError(txt || `HTTP ${res.status}`);
        }
        setRunning(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });
        const { events, remainder } = parseChunk(buffer);
        buffer = remainder;
        for (const ev of events) handleEvent(ev);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-4">
      <KeySettings />

      {!hasKey ? (
        <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">
            No key yet — but you can still read the textbook.
          </p>
          <p className="mt-1">
            Get a key at{' '}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              console.anthropic.com
            </a>
            . It stays in your browser. Charges go to your account, not ours.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <section className="flex h-[640px] flex-col rounded-xl border bg-card text-card-foreground shadow-sm">
          <header className="flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-semibold">Ask an expert</p>
            <select
              value={expert}
              onChange={(e) => setExpert(e.target.value)}
              className="rounded-md border bg-background px-2 py-1 text-xs"
              aria-label="Pre-select expert (skips supervisor)"
            >
              <option value="">Auto-route (supervisor)</option>
              {EXPERT_OPTIONS.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.length === 0 ? (
              <p className="text-muted-foreground">
                Try:{' '}
                <em>&quot;How does Q4_K_M quantization compare to FP16 on Qwen2.5-0.5B?&quot;</em>
              </p>
            ) : null}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3 ${
                  m.role === 'user' ? 'border-primary/50 bg-primary/5' : 'border-muted bg-muted/40'
                }`}
              >
                <p className="text-xs font-semibold text-muted-foreground">
                  {m.role === 'user' ? 'You' : `Expert · ${m.expert ?? 'system'}`}
                </p>
                <p className="mt-1 whitespace-pre-wrap leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="flex gap-2 border-t p-3"
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about LLMs or Agentic AI…"
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
              disabled={running}
            />
            <button
              type="submit"
              disabled={running || !question.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40"
            >
              {running ? '…' : 'Send'}
            </button>
          </form>
        </section>

        <TracePanel steps={steps} route={route} done={done} error={error} running={running} />
      </div>
    </div>
  );
}

const EXPERT_OPTIONS = [
  'quantization',
  'tokenizer',
  'cost',
  'hallucination',
  'rag',
  'agent-loop',
  'tools',
  'patterns',
  'memory',
  'guardrails',
  'multi-agent',
  'planning',
  'evals',
  'mcp',
  'frameworks',
  'computer-use',
  'context',
  'structured-output',
  'caching',
  'failure-modes',
] as const;
