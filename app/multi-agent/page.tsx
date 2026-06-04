import type { Metadata } from 'next';

import { ConceptModulePage } from '@/components/concept-module-page';
import { multiAgentExamples } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Multi-Agent Topologies',
  description:
    'Supervisor, swarm, pipeline, debate, blackboard, subagent delegation. Hand-off semantics + when multi-agent helps vs multiplies cost.',
};

export default function MultiAgentPage(): React.ReactElement {
  return <ConceptModulePage eyebrow="Module L · Agentic AI" data={multiAgentExamples} />;
}
