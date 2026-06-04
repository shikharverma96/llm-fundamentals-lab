import type { Metadata } from 'next';

import { ConceptModulePage } from '@/components/concept-module-page';
import { contextExamples } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Context Engineering',
  description:
    'Seven slots of an agent context window, order effects, compaction strategies, cache breakpoints, retrieval vs injection.',
};

export default function ContextPage(): React.ReactElement {
  return <ConceptModulePage eyebrow="Module Q · Agentic AI" data={contextExamples} />;
}
