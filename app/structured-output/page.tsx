import type { Metadata } from 'next';

import { ConceptModulePage } from '@/components/concept-module-page';
import { structuredOutputExamples } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Structured Outputs',
  description:
    'Tool-as-extractor vs JSON mode vs schema-constrained decoding. Retry strategies, repair prompts, schema discipline.',
};

export default function StructuredOutputPage(): React.ReactElement {
  return <ConceptModulePage eyebrow="Module R · Agentic AI" data={structuredOutputExamples} />;
}
