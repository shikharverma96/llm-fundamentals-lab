import type { Metadata } from 'next';

import { ConceptModulePage } from '@/components/concept-module-page';
import { patternsExamples } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Anthropic Patterns',
  description:
    'Building Effective Agents — six canonical patterns plus extended-thinking + tool use. When to use which, with skeletons.',
};

export default function PatternsPage(): React.ReactElement {
  return <ConceptModulePage eyebrow="Module H · Agentic AI" data={patternsExamples} />;
}
