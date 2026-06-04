import type { Metadata } from 'next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toolsLabExamples as toolsLab } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Tool Design Lab',
  description:
    'What the model actually sees when you "add a tool": name, description, JSON schema. Good vs bad examples, ambiguity pitfalls, copy-paste template.',
};

const TOOL_TEMPLATE = `// Anthropic tool: name + description + JSON schema + handler.
// Lead the description with VERB. End with the constraint.
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";

const inputSchema = z.object({
  query: z.string().min(1).describe("Natural-language search query."),
  limit: z.number().int().min(1).max(20).default(5),
});

export const searchDocsTool: Anthropic.Tool = {
  name: "search_docs",
  description:
    "Full-text search the project docs and return matching passages with URLs. " +
    "Use for any factual question about documented behavior. " +
    "IDEMPOTENT. READ-ONLY.",
  input_schema: {
    type: "object",
    properties: {
      query: { type: "string" },
      limit: { type: "integer", minimum: 1, maximum: 20, default: 5 },
    },
    required: ["query"],
  },
};

export async function handleSearchDocs(rawInput: unknown) {
  // Validate at the boundary — never trust the model's JSON.
  const args = inputSchema.parse(rawInput);
  const hits = await searchIndex(args.query, args.limit);
  // Return STRUCTURED success/error envelope.
  if (hits.length === 0) return { ok: true, hits: [] as const };
  return { ok: true, hits: hits.slice(0, args.limit) };
}`;

export default function ToolsPage(): React.ReactElement {
  const { examples, pitfalls } = toolsLab;
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Module G · Agentic AI
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Tool Design Lab</h1>
        <p className="max-w-3xl text-muted-foreground">
          A tool is the model&apos;s only way to do anything. What the model actually sees is the
          tool&apos;s <strong>name</strong>, <strong>description</strong>, and{' '}
          <strong>JSON schema</strong>. Tool quality dominates agent quality — most &quot;dumb
          agent&quot; problems are bad tool design wearing a model-quality mask.
        </p>
      </header>

      <section aria-labelledby="rules-heading" className="space-y-3">
        <h2 id="rules-heading" className="text-xl font-semibold">
          Five rules that fit on a sticky note
        </h2>
        <ul className="grid gap-3 text-sm md:grid-cols-2">
          {[
            ['Single responsibility', 'One tool does one thing. Two responsibilities = two tools.'],
            ['Verb-led name', 'search_docs, send_email, list_orders. Not "things" or "helper".'],
            [
              'Description = when-to-use',
              'Tell the model WHEN to pick this over its neighbors. End with the constraint (READ-ONLY, IRREVERSIBLE, IDEMPOTENT).',
            ],
            [
              'Tight schema',
              'Enums, patterns, integer-vs-number, minLength. Every loose param is a class of bug.',
            ],
            [
              'Structured errors',
              'Return { ok: false, error: "…" } or set is_error:true. Never apologize in free text — the model believes the apology.',
            ],
          ].map(([title, body]) => (
            <li key={title} className="rounded-lg border bg-card p-4">
              <p className="font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="ex-heading" className="space-y-4">
        <div className="space-y-1">
          <h2 id="ex-heading" className="text-xl font-semibold">
            Side-by-side: good vs bad
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Each pair shows the same intent expressed two ways. The bad one ships in real codebases
            every day.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {examples.map((ex) => (
            <Card
              key={ex.id}
              className={ex.verdict === 'good' ? 'border-emerald-300' : 'border-rose-300'}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2 text-base">
                  <code className="font-mono text-sm">{ex.name}</code>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      ex.verdict === 'good'
                        ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100'
                        : 'bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100'
                    }`}
                  >
                    {ex.verdict}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Description: </span>
                  {ex.description}
                </p>
                <details>
                  <summary className="cursor-pointer text-muted-foreground">schema</summary>
                  <pre className="mt-1 overflow-x-auto rounded bg-muted/40 p-2">
                    {JSON.stringify(ex.schema, null, 2)}
                  </pre>
                </details>
                <p className="text-foreground">
                  <span className="font-semibold">Why: </span>
                  <span className="text-muted-foreground">{ex.rationale}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="pit-heading" className="space-y-3">
        <h2 id="pit-heading" className="text-xl font-semibold">
          Pitfalls
        </h2>
        <ul className="grid gap-3 text-sm md:grid-cols-2">
          {pitfalls.map((p) => (
            <li key={p.id} className="rounded-lg border bg-card p-4">
              <p className="font-semibold text-foreground">{p.title}</p>
              <p className="mt-1 text-muted-foreground">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="code-heading" className="space-y-3">
        <h2 id="code-heading" className="text-xl font-semibold">
          Lift-and-shift: tool template
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Pattern that holds up: Zod for validation at the boundary, Anthropic schema for the wire,
          structured success/error envelope, IDEMPOTENT/READ-ONLY/IRREVERSIBLE in the description.
        </p>
        <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-4 text-xs leading-relaxed">
          <code>{TOOL_TEMPLATE}</code>
        </pre>
      </section>
    </div>
  );
}
