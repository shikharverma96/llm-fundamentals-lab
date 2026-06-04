import type { Metadata } from 'next';

import { ConceptModulePage } from '@/components/concept-module-page';
import { planningExamples } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Planning Patterns',
  description:
    'ReAct vs Plan-and-Execute vs Reflexion vs Tree-of-Thoughts vs Self-Ask. When to escalate from straight loop to deliberation.',
};

export default function PlanningPage(): React.ReactElement {
  return <ConceptModulePage eyebrow="Module K · Agentic AI" data={planningExamples} />;
}
