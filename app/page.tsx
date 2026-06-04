import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Module {
  href: string;
  title: string;
  description: string;
  eyebrow: string;
}

interface ModuleGroup {
  id: string;
  heading: string;
  subhead: string;
  modules: readonly Module[];
}

const GROUPS: readonly ModuleGroup[] = [
  {
    id: 'fundamentals',
    heading: 'LLM Fundamentals',
    subhead: 'What the model is and what it costs.',
    modules: [
      {
        href: '/quantization',
        title: 'Quantization Visualizer',
        description:
          'File size, RAM, throughput, perplexity, MMLU across FP16 → INT2. Find the quality cliff.',
        eyebrow: 'Module A',
      },
      {
        href: '/tokenizer',
        title: 'Tokenizer Playground',
        description: 'Compare token counts across GPT-4o, GPT-4, Llama 3, Mistral, Gemma.',
        eyebrow: 'Module B',
      },
      {
        href: '/cost-calculator',
        title: 'Cost Calculator',
        description: 'Monthly cost, latency, privacy, context window across providers.',
        eyebrow: 'Module C',
      },
      {
        href: '/hallucination',
        title: 'Hallucination Lab',
        description: 'What it is, why it happens, how to stop it.',
        eyebrow: 'Module D',
      },
      {
        href: '/rag',
        title: 'RAG Patterns',
        description: 'Chunk → embed → retrieve → rerank → generate. End-to-end.',
        eyebrow: 'Module E',
      },
    ],
  },
  {
    id: 'foundations',
    heading: 'Agent Foundations',
    subhead: 'The think-act-observe loop and what feeds it.',
    modules: [
      {
        href: '/agent-loop',
        title: 'Agent Loop Anatomy',
        description: 'Stepable trace. Stop conditions, parse failures, max-iter, error envelopes.',
        eyebrow: 'Module F',
      },
      {
        href: '/tools',
        title: 'Tool Design Lab',
        description: 'What the model sees. Good vs bad tools, ambiguity, schemas.',
        eyebrow: 'Module G',
      },
      {
        href: '/patterns',
        title: 'Anthropic Patterns',
        description:
          'Prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer.',
        eyebrow: 'Module H',
      },
      {
        href: '/context',
        title: 'Context Engineering',
        description: 'Seven slots of the window, order effects, compaction, cache breakpoints.',
        eyebrow: 'Module Q',
      },
      {
        href: '/structured-output',
        title: 'Structured Outputs',
        description: 'Tool-as-extractor vs JSON mode vs schema-constrained decoding.',
        eyebrow: 'Module R',
      },
    ],
  },
  {
    id: 'infra',
    heading: 'Agent Infrastructure',
    subhead: 'Memory, money, observability, and failure.',
    modules: [
      {
        href: '/memory',
        title: 'Memory Architecture',
        description: 'Scratchpad, working, episodic, semantic, procedural. What goes where.',
        eyebrow: 'Module I',
      },
      {
        href: '/caching',
        title: 'Prompt Caching',
        description: '~90% discount on cached input. Breakpoint placement, TTL, invalidation.',
        eyebrow: 'Module S',
      },
      {
        href: '/evals',
        title: 'Evals & Observability',
        description: 'Task success, trajectory quality, tool-call accuracy, cost-per-task.',
        eyebrow: 'Module M',
      },
      {
        href: '/failure-modes',
        title: 'Failure Modes',
        description: 'Twelve named failure modes. Cause, detection, mechanical fix.',
        eyebrow: 'Module T',
      },
    ],
  },
  {
    id: 'topologies',
    heading: 'Topologies & Defense',
    subhead: 'Planning, multi-agent, guardrails, MCP.',
    modules: [
      {
        href: '/planning',
        title: 'Planning Patterns',
        description: 'ReAct vs Plan-and-Execute vs Reflexion vs ToT vs Self-Ask.',
        eyebrow: 'Module K',
      },
      {
        href: '/multi-agent',
        title: 'Multi-Agent Topologies',
        description: 'Supervisor, swarm, pipeline, debate, blackboard, subagent delegation.',
        eyebrow: 'Module L',
      },
      {
        href: '/guardrails',
        title: 'Guardrails & Prompt Injection',
        description: 'Direct vs indirect injection. Defense-in-depth stack.',
        eyebrow: 'Module J',
      },
      {
        href: '/mcp',
        title: 'Model Context Protocol',
        description: 'Client/server, transports, capability negotiation, security model.',
        eyebrow: 'Module N',
      },
    ],
  },
  {
    id: 'ecosystem',
    heading: 'Ecosystem',
    subhead: 'What lives outside your codebase.',
    modules: [
      {
        href: '/frameworks',
        title: 'Framework Decision Matrix',
        description: 'Agent SDK, LangGraph, OpenAI Agents, AutoGen, CrewAI, smolagents.',
        eyebrow: 'Module O',
      },
      {
        href: '/computer-use',
        title: 'Computer / Browser Use',
        description: 'Vision vs DOM action spaces. Why an API is almost always right.',
        eyebrow: 'Module P',
      },
    ],
  },
];

const LAB_LINK = {
  href: '/ask',
  title: 'Ask an Expert',
  description:
    'BYOK. Live multi-agent backend: supervisor routes your question to one of 20 topic experts. Trace each step.',
};

export default function HomePage(): React.ReactElement {
  return (
    <div className="space-y-14">
      <section className="space-y-4 text-balance">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Interactive · static textbook + live lab
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Foundational LLM mechanics + the agentic stack — made tangible.
        </h1>
        <p className="max-w-3xl text-lg text-muted-foreground">
          Twenty modules: from FP16 vs INT4 to multi-agent topologies, with a live multi-agent
          backend you can query with your own Anthropic key.
        </p>
      </section>

      <section className="space-y-2">
        <Link
          href={LAB_LINK.href}
          className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Card className="border-emerald-300 transition-shadow hover:shadow-md dark:border-emerald-700">
            <CardHeader>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Lab — live agentic backend
              </p>
              <CardTitle className="group-hover:underline">{LAB_LINK.title}</CardTitle>
              <CardDescription className="pt-2">{LAB_LINK.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-sm font-medium text-primary">Open lab →</span>
            </CardContent>
          </Card>
        </Link>
      </section>

      {GROUPS.map((group) => (
        <section key={group.id} aria-labelledby={`${group.id}-heading`} className="space-y-4">
          <div className="space-y-1">
            <h2 id={`${group.id}-heading`} className="text-xl font-semibold">
              {group.heading}
            </h2>
            <p className="text-sm text-muted-foreground">{group.subhead}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {group.modules.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {m.eyebrow}
                    </p>
                    <CardTitle className="group-hover:underline">{m.title}</CardTitle>
                    <CardDescription className="pt-2">{m.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm font-medium text-primary">Open →</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
