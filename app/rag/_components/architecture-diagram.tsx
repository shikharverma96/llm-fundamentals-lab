import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Node {
  id: string;
  label: string;
  sub: string;
  tone: 'query' | 'index' | 'compute' | 'output';
}

const QUERY_ROW: Node[] = [
  { id: 'q', label: 'User Query', sub: '"What was Q3 revenue?"', tone: 'query' },
  { id: 'e', label: 'Embed', sub: 'same model as corpus', tone: 'compute' },
  { id: 'v', label: 'Vector DB', sub: 'HNSW · metadata filters', tone: 'index' },
  { id: 'k', label: 'Top-K', sub: 'dense + BM25 (hybrid)', tone: 'index' },
  { id: 'r', label: 'Rerank', sub: 'cross-encoder · K → N', tone: 'compute' },
  { id: 'p', label: 'LLM + Sources', sub: 'cite [#N] only', tone: 'compute' },
  { id: 'a', label: 'Answer + Citations', sub: 'resolved & verifiable', tone: 'output' },
];

const INGEST_ROW: Node[] = [
  { id: 'c', label: 'Corpus', sub: 'PDFs, HTML, Notion', tone: 'query' },
  { id: 'i', label: 'Ingest', sub: 'parse · OCR · clean', tone: 'compute' },
  { id: 'ch', label: 'Chunk', sub: '~300 tok · 15% overlap', tone: 'compute' },
  { id: 'em', label: 'Embed Chunks', sub: 'bulk · cached', tone: 'compute' },
];

const TONE_CLASS: Record<Node['tone'], string> = {
  query:
    'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-100',
  index:
    'border-violet-300 bg-violet-50 text-violet-900 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-100',
  compute:
    'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100',
  output:
    'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100',
};

function Box({ node }: { node: Node }): React.ReactElement {
  return (
    <div
      className={cn(
        'flex min-w-[8.5rem] flex-1 flex-col gap-1 rounded-lg border px-3 py-2 text-center shadow-sm',
        TONE_CLASS[node.tone],
      )}
    >
      <span className="text-sm font-semibold leading-tight">{node.label}</span>
      <span className="text-[10px] uppercase tracking-wide opacity-80">{node.sub}</span>
    </div>
  );
}

function Arrow(): React.ReactElement {
  return (
    <div aria-hidden className="flex items-center justify-center px-1 text-muted-foreground">
      <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
        <path
          d="M1 7h16M13 2l5 5-5 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function Row({ nodes }: { nodes: Node[] }): React.ReactElement {
  return (
    <div className="flex flex-wrap items-stretch justify-center gap-1">
      {nodes.map((node, idx) => (
        <div key={node.id} className="flex items-stretch">
          <Box node={node} />
          {idx < nodes.length - 1 ? <Arrow /> : null}
        </div>
      ))}
    </div>
  );
}

interface Props {
  mermaid: string;
}

export function ArchitectureDiagram({ mermaid }: Props): React.ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Architecture</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Query path (runs per request)
            </p>
            <Row nodes={QUERY_ROW} />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Index path (runs at ingest / re-index)
            </p>
            <Row nodes={INGEST_ROW} />
          </div>
          <p className="text-xs text-muted-foreground">
            The query and index paths must share the same embedding model. If they drift, distances
            stop meaning anything.
          </p>
        </div>

        <details className="rounded-lg border bg-muted/40 p-3 text-sm">
          <summary className="cursor-pointer font-medium">Mermaid source</summary>
          <pre className="mt-2 overflow-x-auto rounded bg-background p-3 font-mono text-xs">
            {mermaid}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
}
