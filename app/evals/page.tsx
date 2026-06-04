import type { Metadata } from 'next';

import { ConceptModulePage } from '@/components/concept-module-page';
import { evalsExamples } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Agent Evals & Observability',
  description:
    'Eval dimensions specific to agents: task success, trajectory quality, tool-call accuracy, step efficiency, cost-per-task.',
};

export default function EvalsPage(): React.ReactElement {
  return <ConceptModulePage eyebrow="Module M · Agentic AI" data={evalsExamples} />;
}
