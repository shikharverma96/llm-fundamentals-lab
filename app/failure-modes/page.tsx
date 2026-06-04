import type { Metadata } from 'next';

import { ConceptModulePage } from '@/components/concept-module-page';
import { failureModesExamples } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Agent Failure Modes',
  description:
    'Twelve named failure modes — cause, detection signal, mechanical fix. The taxonomy that indexes every other module.',
};

export default function FailureModesPage(): React.ReactElement {
  return <ConceptModulePage eyebrow="Module T · Agentic AI" data={failureModesExamples} />;
}
