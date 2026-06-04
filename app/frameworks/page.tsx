import type { Metadata } from 'next';

import { ConceptModulePage } from '@/components/concept-module-page';
import { frameworksExamples } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Framework Decision Matrix',
  description:
    'Side-by-side: Claude Agent SDK, LangGraph, OpenAI Agents SDK, AutoGen, CrewAI, smolagents, Pydantic AI, Mastra. Pick by use case.',
};

export default function FrameworksPage(): React.ReactElement {
  return <ConceptModulePage eyebrow="Module O · Agentic AI" data={frameworksExamples} />;
}
