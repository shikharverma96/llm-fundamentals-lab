import type { Metadata } from 'next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ragExamples } from '@/lib/data';

import { ArchitectureDiagram } from './_components/architecture-diagram';
import { ChunkingDemo } from './_components/chunking-demo';
import { DoDont } from './_components/do-dont';
import { Pitfalls } from './_components/pitfalls';

export const metadata: Metadata = {
  title: 'RAG Patterns',
  description:
    "End-to-end retrieval-augmented generation pipeline with worked examples, do/don't guidance, common pitfalls, and a production checklist.",
};

export default function RagPage(): React.ReactElement {
  const { query, sampleDocument, pipeline, dos, donts, pitfalls, checklist, mermaid } = ragExamples;
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Module E
        </p>
        <h1 className="text-3xl font-bold tracking-tight">RAG Patterns</h1>
        <p className="max-w-3xl text-muted-foreground">
          Retrieval-Augmented Generation grounds an LLM in your documents instead of its parametric
          memory. This module walks the full pipeline — ingest, chunk, embed, retrieve, rerank,
          assemble, generate — with a worked example, pitfalls per stage, and a production checklist
          you can copy.
        </p>
      </header>

      <section aria-labelledby="def-heading" className="space-y-3">
        <h2 id="def-heading" className="text-xl font-semibold">
          What RAG is, in one paragraph
        </h2>
        <p className="max-w-3xl text-muted-foreground">
          RAG = <span className="font-medium text-foreground">retrieve, then generate</span>. At
          query time you fetch the most relevant passages from a vector + keyword index over your
          corpus, drop them into the prompt as labelled sources, and instruct the model to answer{' '}
          <em>only</em> from those sources, citing each claim. Done right, it collapses the
          factual-hallucination rate, gives every answer a verifiable citation trail, and lets you
          swap the underlying LLM without retraining anything.
        </p>
      </section>

      <section aria-labelledby="example-heading" className="space-y-4">
        <div className="space-y-1">
          <h2 id="example-heading" className="text-xl font-semibold">
            The running example
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Every stage below uses the same query against the same passage so you can see how the
            same fact flows through ingestion, retrieval, and answer assembly.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Query</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-sm">{query}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Source document</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{sampleDocument}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-labelledby="arch-heading" className="space-y-4">
        <div className="space-y-1">
          <h2 id="arch-heading" className="text-xl font-semibold">
            Architecture
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Two paths share the same embedding model. The index path runs offline at ingest time;
            the query path runs per request.
          </p>
        </div>
        <ArchitectureDiagram mermaid={mermaid} />
      </section>

      <section aria-labelledby="pipeline-heading" className="space-y-4">
        <div className="space-y-1">
          <h2 id="pipeline-heading" className="text-xl font-semibold">
            Pipeline, stage by stage
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Each stage names what it does, walks the running example through it, calls out the usual
            way it breaks, and lists the tools people reach for.
          </p>
        </div>
        <ol className="space-y-4">
          {pipeline.map((stage, idx) => (
            <li key={stage.id}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Step {idx + 1}
                    </span>
                    <CardTitle className="text-lg">{stage.title}</CardTitle>
                  </div>
                  <p className="pt-1 text-sm text-muted-foreground">{stage.oneLiner}</p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>
                    <span className="font-medium">What it does: </span>
                    <span className="text-muted-foreground">{stage.what}</span>
                  </p>
                  <div className="rounded-lg border-l-4 border-sky-400 bg-sky-50/60 p-3 dark:bg-sky-950/30">
                    <p className="text-xs font-medium uppercase tracking-wider text-sky-700 dark:text-sky-300">
                      Example
                    </p>
                    <p className="mt-1 text-sm text-foreground">{stage.example}</p>
                  </div>
                  <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50/60 p-3 dark:bg-amber-950/30">
                    <p className="text-xs font-medium uppercase tracking-wider text-amber-700 dark:text-amber-300">
                      How it usually breaks
                    </p>
                    <p className="mt-1 text-sm text-foreground">{stage.pitfall}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Tools:
                    </span>
                    {stage.tools.map((t) => (
                      <span
                        key={t}
                        className="rounded-md border bg-muted/50 px-2 py-0.5 font-mono text-[11px]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="chunk-heading" className="space-y-4">
        <div className="space-y-1">
          <h2 id="chunk-heading" className="text-xl font-semibold">
            Chunking, interactive
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Chunk size and overlap are the two knobs most teams get wrong. Drag them and watch how
            the boundaries shift on real prose.
          </p>
        </div>
        <ChunkingDemo initialText={sampleDocument} />
      </section>

      <section aria-labelledby="dodont-heading" className="space-y-4">
        <div className="space-y-1">
          <h2 id="dodont-heading" className="text-xl font-semibold">
            Do / don&rsquo;t
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Lifted from real production systems. Every item has a single, concrete reason — no
            cargo-cult advice.
          </p>
        </div>
        <DoDont dos={dos} donts={donts} />
      </section>

      <section aria-labelledby="pitfalls-heading" className="space-y-4">
        <div className="space-y-1">
          <h2 id="pitfalls-heading" className="text-xl font-semibold">
            Common failure modes
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            The symptoms you actually see in production and the fix that resolves each.
          </p>
        </div>
        <Pitfalls pitfalls={pitfalls} />
      </section>

      <section aria-labelledby="checklist-heading" className="space-y-4">
        <div className="space-y-1">
          <h2 id="checklist-heading" className="text-xl font-semibold">
            Production checklist
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Hard-won non-functional requirements. Tick each before declaring a RAG system shippable.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {checklist.map((group) => (
            <Card key={group.group}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{group.group}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span
                        aria-hidden
                        className="mt-1 inline-block h-3.5 w-3.5 flex-shrink-0 rounded-sm border border-muted-foreground/50"
                      />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="lift-heading" className="space-y-3">
        <h2 id="lift-heading" className="text-xl font-semibold">
          Lift-and-shift into your own project
        </h2>
        <p className="max-w-3xl text-muted-foreground">
          Want this pipeline in a new repo? Paste the following prompt into a fresh Claude Code
          session inside an empty directory — it spells out the architecture decisions on this page
          in a single shot.
        </p>
        <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 font-mono text-[11px] leading-relaxed">
          {`Build a production RAG service with these decisions baked in:
- Ingest: layout-aware parsing (unstructured / LlamaParse), preserve metadata
  (source URL, page, section, timestamp) on every chunk.
- Chunk: ~300 tokens, 15% overlap, recursive splitter that respects headings.
- Embed: text-embedding-3-small (or bge-small for self-hosted). One model for
  corpus AND queries — never mix.
- Index: pgvector with HNSW (m=16, ef_construction=64). Row-level security for
  multi-tenancy. Hybrid: dense + BM25 over tsvector.
- Retrieve: top-20 hybrid via Reciprocal Rank Fusion. Metadata filters always.
- Rerank: bge-reranker-v2-m3 (or Cohere Rerank v3) down to top-3 to top-5.
- Assemble: system prompt forbids answers outside Sources block. Number chunks
  [#1], [#2]. Question goes AFTER sources, not before.
- Generate: stream, parse [#N] markers, resolve to (source, page) for UI
  citations. Validate every emitted N exists in the sources sent.
- Confidence gate: if max rerank score < threshold, return "I can't answer
  this from the provided sources" instead of guessing.
- Eval: 50-200 reference Q/A pairs. Track recall@k, MRR, faithfulness, answer
  groundedness on every change. No vibes.
- Observability: log retrieved chunk IDs, rerank scores, cited chunk IDs,
  latency per stage, token spend per request.`}
        </pre>
      </section>
    </div>
  );
}
