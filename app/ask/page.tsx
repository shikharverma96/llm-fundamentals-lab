import type { Metadata } from 'next';

import { AskClient } from './_components/ask-client';

export const metadata: Metadata = {
  title: 'Ask an Expert',
  description:
    'Live multi-agent backend: a Haiku supervisor routes your question to one of 20 topic experts. Watch every step of the agent loop in real time.',
};

interface PageProps {
  searchParams?: Promise<{ expert?: string }>;
}

export default async function AskPage(props: PageProps): Promise<React.ReactElement> {
  const params = (await props.searchParams) ?? {};
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Lab · live agents
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Ask an expert</h1>
        <p className="max-w-3xl text-muted-foreground">
          The educational pages are the textbook. This is the lab. Type a question — a Haiku
          supervisor classifies it and hands off to one of 20 topic experts (Sonnet 4.5). Every step
          streams to the trace panel on the right: routing decision, tool calls, tool results,
          intermediate thinking, final answer. Bring your own Anthropic API key — it stays in your
          browser and is sent only to <code>/api/ask</code>.
        </p>
      </header>

      <AskClient initialExpert={params.expert} />

      <section className="rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground">
        <h2 className="text-base font-semibold text-foreground">
          How the trace maps to the agent loop
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <span className="font-medium text-foreground">handoff</span> · supervisor picks the
            expert via the <code>route_to_expert</code> tool.
          </li>
          <li>
            <span className="font-medium text-foreground">thinking</span> · expert reads tool
            results, plans next call.
          </li>
          <li>
            <span className="font-medium text-foreground">tool_call</span> · expert invokes a
            read-only retrieval tool over the same JSON files the textbook uses.
          </li>
          <li>
            <span className="font-medium text-foreground">tool_result</span> · structured payload
            comes back, gets truncated to 6 KB if oversized.
          </li>
          <li>
            <span className="font-medium text-foreground">final</span> · expert emits the answer.
            Loop ends. Total tokens + latency reported below.
          </li>
        </ul>
      </section>
    </div>
  );
}
