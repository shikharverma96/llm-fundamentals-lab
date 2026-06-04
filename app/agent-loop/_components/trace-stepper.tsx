'use client';

import { useMemo, useState } from 'react';

import {
  formatToolPayload,
  stepLabel,
  stepToneClass,
  totals,
  truncateForList,
} from '@/lib/agent-trace';
import type { AgentTrace } from '@/lib/schemas/agent-trace';

interface Props {
  trace: AgentTrace;
}

export function TraceStepper({ trace }: Props): React.ReactElement {
  const [idx, setIdx] = useState(0);
  const step = trace.steps[idx];
  const stats = useMemo(() => totals(trace), [trace]);
  const visible = trace.steps.slice(0, idx + 1);

  if (!step) {
    return <p className="text-sm text-muted-foreground">No steps in trace.</p>;
  }

  return (
    <div
      className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm md:p-6"
      aria-label="Agent trace stepper"
    >
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Task</p>
        <p className="text-sm">{trace.task}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent disabled:opacity-40"
        >
          ← Prev
        </button>
        <input
          type="range"
          min={0}
          max={trace.steps.length - 1}
          value={idx}
          onChange={(e) => setIdx(Number(e.target.value))}
          aria-label="Scrub trace step"
          className="h-1 flex-1 cursor-pointer"
        />
        <button
          type="button"
          onClick={() => setIdx((i) => Math.min(trace.steps.length - 1, i + 1))}
          disabled={idx === trace.steps.length - 1}
          className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent disabled:opacity-40"
        >
          Next →
        </button>
        <span className="text-sm tabular-nums text-muted-foreground">
          Step {idx + 1} / {trace.steps.length}
        </span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <aside aria-label="Step list" className="space-y-2">
          {trace.steps.map((s, i) => (
            <button
              type="button"
              key={s.step}
              onClick={() => setIdx(i)}
              className={`block w-full rounded-md border px-3 py-2 text-left text-xs transition ${
                i === idx
                  ? 'border-primary bg-primary/10'
                  : 'border-transparent hover:border-border'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">
                  {s.step.toString().padStart(2, '0')} · {stepLabel(s)}
                </span>
                <span className="text-muted-foreground">
                  {s.latencyMs ? `${s.latencyMs}ms` : ''}
                </span>
              </div>
              <div className="mt-1 line-clamp-2 text-muted-foreground" aria-hidden>
                {truncateForList(s.content, 100)}
              </div>
            </button>
          ))}
        </aside>

        <section aria-label="Current step detail" aria-live="polite" className="space-y-3">
          <div className={`rounded-lg border-2 p-4 ${stepToneClass(step.kind)}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">
                {stepLabel(step)} <span className="text-muted-foreground">· {step.agent}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {step.latencyMs ? `${step.latencyMs} ms · ` : ''}
                in {step.tokens?.input ?? 0} / out {step.tokens?.output ?? 0}
              </p>
            </div>
            <pre className="mt-3 whitespace-pre-wrap break-words text-xs leading-relaxed">
              {step.content}
            </pre>
            {step.tool?.args ? (
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer text-muted-foreground">tool args</summary>
                <pre className="mt-1 whitespace-pre-wrap break-words">
                  {formatToolPayload(step.tool.args)}
                </pre>
              </details>
            ) : null}
            {step.tool?.result !== undefined ? (
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer text-muted-foreground">tool result</summary>
                <pre className="mt-1 whitespace-pre-wrap break-words">
                  {formatToolPayload(step.tool.result)}
                </pre>
              </details>
            ) : null}
          </div>

          <div className="rounded-lg border bg-muted/40 p-4 text-xs">
            <p className="font-medium text-foreground">Context window after this step</p>
            <p className="mt-1 text-muted-foreground">
              Cumulative input tokens: {visible.reduce((a, s) => a + (s.tokens?.input ?? 0), 0)} ·
              cumulative output: {visible.reduce((a, s) => a + (s.tokens?.output ?? 0), 0)} ·
              elapsed {visible.reduce((a, s) => a + (s.latencyMs ?? 0), 0)}ms
            </p>
            <p className="mt-2 text-muted-foreground">
              At this point, the agent has visibility into all previous steps plus the new
              tool_result. Older verbose tool_results are candidates for compaction once the budget
              tightens.
            </p>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-3 rounded-lg border bg-muted/30 p-4 text-xs sm:grid-cols-4">
        <Stat label="Total steps" value={stats.steps.toString()} />
        <Stat label="Tokens in" value={stats.tokensIn.toLocaleString()} />
        <Stat label="Tokens out" value={stats.tokensOut.toLocaleString()} />
        <Stat label="Latency" value={`${stats.latencyMs.toLocaleString()} ms`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="text-base font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
