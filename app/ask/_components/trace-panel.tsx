'use client';

import { formatToolPayload, stepLabel, stepToneClass } from '@/lib/agent-trace';
import type { AgentStep } from '@/lib/schemas/agent-trace';

interface Props {
  steps: AgentStep[];
  route: { expert: string; reason: string; preselected: boolean } | null;
  done: {
    expertUsed: string;
    stopReason: string;
    iterations: number;
    totalMs: number;
    totalTokens: { in: number; out: number };
  } | null;
  error: string | null;
  running: boolean;
}

export function TracePanel({ steps, route, done, error, running }: Props): React.ReactElement {
  return (
    <aside
      aria-label="Live agent trace"
      className="flex h-full flex-col rounded-xl border bg-card text-card-foreground shadow-sm"
    >
      <div className="border-b px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Live trace
        </p>
        <p className="text-sm">
          {running
            ? 'Streaming…'
            : steps.length === 0
              ? 'Idle — ask a question to begin.'
              : 'Done.'}
        </p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {route ? (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs dark:border-amber-700 dark:bg-amber-950/40">
            <p className="font-semibold">
              {route.preselected ? 'Pre-selected expert' : 'Supervisor routed →'}{' '}
              <span className="font-mono">{route.expert}</span>
            </p>
            <p className="mt-1 text-muted-foreground">{route.reason}</p>
          </div>
        ) : null}

        {steps.map((s) => (
          <div
            key={`${s.step}-${s.kind}`}
            className={`rounded-md border-l-4 px-3 py-2 text-xs ${stepToneClass(s.kind)}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">
                {String(s.step).padStart(2, '0')} · {stepLabel(s)}
              </span>
              <span className="text-muted-foreground">{s.agent}</span>
            </div>
            <pre className="mt-1 whitespace-pre-wrap break-words leading-snug">{s.content}</pre>
            {s.tool?.args ? (
              <details className="mt-1">
                <summary className="cursor-pointer text-muted-foreground">args</summary>
                <pre className="whitespace-pre-wrap break-words">
                  {formatToolPayload(s.tool.args)}
                </pre>
              </details>
            ) : null}
            {s.tool?.result !== undefined ? (
              <details className="mt-1">
                <summary className="cursor-pointer text-muted-foreground">result</summary>
                <pre className="whitespace-pre-wrap break-words">
                  {formatToolPayload(s.tool.result)}
                </pre>
              </details>
            ) : null}
          </div>
        ))}

        {error ? (
          <div className="rounded-md border border-rose-400 bg-rose-50 p-3 text-xs text-rose-900 dark:border-rose-700 dark:bg-rose-950/50 dark:text-rose-100">
            <p className="font-semibold">Error</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : null}
      </div>

      {done ? (
        <div className="border-t px-4 py-3 text-xs">
          <p className="font-semibold">
            Stop · <span className="font-mono">{done.stopReason}</span> · {done.iterations} iter
          </p>
          <p className="text-muted-foreground">
            {done.totalMs} ms · in {done.totalTokens.in} / out {done.totalTokens.out} · expert{' '}
            <span className="font-mono">{done.expertUsed}</span>
          </p>
        </div>
      ) : null}
    </aside>
  );
}
