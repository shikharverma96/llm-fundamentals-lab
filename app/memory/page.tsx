import type { Metadata } from 'next';

import { ConceptModulePage } from '@/components/concept-module-page';
import { memoryExamples } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Memory Architecture',
  description: 'Five memory stores side-by-side, what goes where, retention horizons, retrieval.',
};

export default function MemoryPage(): React.ReactElement {
  return <ConceptModulePage eyebrow="Module I · Agentic AI" data={memoryExamples} />;
}
