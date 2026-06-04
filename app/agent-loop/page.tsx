import type { Metadata } from 'next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { agentLoopExamples } from '@/lib/data';

import { TraceStepper } from './_components/trace-stepper';

export const metadata: Metadata = {
  title: 'Agent Loop Anatomy',
  description:
    'The think → act → observe cycle that drives every LLM agent — with a scrub-through trace, common failure modes, and a minimal correct loop you can copy.',
};

const LOOP_CODE = `// Minimal-but-correct single-agent loop. Type-safe, retries safely, bounded.
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const client = new Anthropic();
const MAX_ITER = 10;

type Tool = {
  name: string;
  description: string;
  input_schema: object;
  handler: (args: unknown) => Promise<unknown>;
};

export async function runAgent(
  systemPrompt: string,
  userTask: string,
  tools: Tool[],
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userTask },
  ];
  const toolDefs = tools.map(({ name, description, input_schema }) => ({
    name,
    description,
    input_schema,
  }));

  for (let i = 0; i < MAX_ITER; i++) {
    const res = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: systemPrompt,
      tools: toolDefs,
      messages,
    });

    // 1. Record assistant turn (always — keeps history consistent on next turn).
    messages.push({ role: "assistant", content: res.content });

    // 2. End condition: model stopped naturally with text.
    if (res.stop_reason === "end_turn") {
      const text = res.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
      return text;
    }

    // 3. Tool calls: run them, attach results, loop.
    const toolUses = res.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );
    if (toolUses.length === 0) break;

    const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
      toolUses.map(async (tu) => {
        const tool = tools.find((t) => t.name === tu.name);
        if (!tool) {
          return {
            type: "tool_result",
            tool_use_id: tu.id,
            is_error: true,
            content: \`Unknown tool: \${tu.name}\`,
          };
        }
        try {
          const out = await tool.handler(tu.input);
          return {
            type: "tool_result",
            tool_use_id: tu.id,
            content: JSON.stringify(out).slice(0, 8000), // truncate explicitly
          };
        } catch (err) {
          return {
            type: "tool_result",
            tool_use_id: tu.id,
            is_error: true,
            content: err instanceof Error ? err.message : String(err),
          };
        }
      }),
    );
    messages.push({ role: "user", content: toolResults });
  }

  throw new Error("Agent exceeded max iterations without producing a final answer.");
}`;

export default function AgentLoopPage(): React.ReactElement {
  const { trace, gotchas } = agentLoopExamples;
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Module F · Agentic AI
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Agent Loop Anatomy</h1>
        <p className="max-w-3xl text-muted-foreground">
          Strip away every framework and an LLM agent is one tight loop:{' '}
          <span className="font-medium text-foreground">think → act → observe → repeat</span>. The
          model decides what to do, the harness executes the tool, the result feeds back into
          context, and the model decides again. Everything else — planning, multi-agent, memory — is
          built on this primitive.
        </p>
      </header>

      <section aria-labelledby="cycle-heading" className="space-y-4">
        <h2 id="cycle-heading" className="text-xl font-semibold">
          The four phases of one iteration
        </h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: '1 · Think',
              body: 'Model reads the conversation + tool definitions and produces either (a) text for the user or (b) a tool_use block with a name + JSON args.',
            },
            {
              title: '2 · Act',
              body: 'Harness validates the tool exists, parses args against the schema, runs the handler with a timeout, captures the return value or error.',
            },
            {
              title: '3 · Observe',
              body: 'Result (or error) is wrapped as a tool_result block and appended to the message list. Errors carry is_error:true so the model knows.',
            },
            {
              title: '4 · Repeat or stop',
              body: 'Stop when stop_reason is end_turn, max-iter hit, or hard error. Otherwise call the model again with the now-longer message list.',
            },
          ].map((p) => (
            <Card key={p.title}>
              <CardHeader>
                <CardTitle className="text-base">{p.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{p.body}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="stepper-heading" className="space-y-4">
        <div className="space-y-1">
          <h2 id="stepper-heading" className="text-xl font-semibold">
            Walk through a real trace
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Mocked but realistic: a research agent answers a population question over two tools.
            Scrub the slider to see how the message list grows, when tool errors would land, and
            where the model decides to stop.
          </p>
        </div>
        <TraceStepper trace={trace} />
      </section>

      <section aria-labelledby="gotchas-heading" className="space-y-4">
        <div className="space-y-1">
          <h2 id="gotchas-heading" className="text-xl font-semibold">
            Failure modes & fixes
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Every gotcha here has shipped to prod somewhere. The fixes are mechanical — most fit in
            5–20 lines around your loop.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {gotchas.map((g) => (
            <Card key={g.id}>
              <CardHeader>
                <CardTitle className="text-base">{g.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Symptom · </span>
                  <span className="text-muted-foreground">{g.symptom}</span>
                </p>
                <p>
                  <span className="font-semibold">Fix · </span>
                  <span className="text-muted-foreground">{g.fix}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="stop-heading" className="space-y-4">
        <h2 id="stop-heading" className="text-xl font-semibold">
          Stop conditions you must implement
        </h2>
        <ul className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <li className="rounded-md border bg-card p-3">
            <span className="font-semibold text-foreground">end_turn</span> — model finishes without
            requesting a tool. The happy path.
          </li>
          <li className="rounded-md border bg-card p-3">
            <span className="font-semibold text-foreground">max_iter</span> — hard cap. Return
            partial state with an explicit error, do not silently truncate.
          </li>
          <li className="rounded-md border bg-card p-3">
            <span className="font-semibold text-foreground">budget_exceeded</span> — track
            cumulative tokens and dollar cost; cancel before runaway.
          </li>
          <li className="rounded-md border bg-card p-3">
            <span className="font-semibold text-foreground">unrecoverable_error</span> — a tool
            handler crashes the process or the API returns 5xx after retry. Surface, do not loop.
          </li>
        </ul>
      </section>

      <section aria-labelledby="code-heading" className="space-y-3">
        <h2 id="code-heading" className="text-xl font-semibold">
          Lift-and-shift: minimal correct loop
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          The whole thing in one file. Bounded iterations, structured tool errors, explicit
          truncation, parallel tool execution where the model requests it, history preserved across
          turns. Drop it in, swap the model, ship.
        </p>
        <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-4 text-xs leading-relaxed">
          <code>{LOOP_CODE}</code>
        </pre>
      </section>
    </div>
  );
}
