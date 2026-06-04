import type { Metadata } from 'next';

import { ConceptModulePage } from '@/components/concept-module-page';
import { mcpExamples } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Model Context Protocol',
  description:
    'MCP protocol overview: client/server, transports, capability negotiation. Worked TS example + security model.',
};

export default function McpPage(): React.ReactElement {
  return <ConceptModulePage eyebrow="Module N · Agentic AI" data={mcpExamples} />;
}
