import type { Metadata } from 'next';

import { ConceptModulePage } from '@/components/concept-module-page';
import { guardrailsExamples } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Guardrails & Prompt Injection',
  description:
    'Direct vs indirect prompt injection. Defense-in-depth stack: input filters, output validators, sandboxing, capability scoping.',
};

export default function GuardrailsPage(): React.ReactElement {
  return <ConceptModulePage eyebrow="Module J · Agentic AI" data={guardrailsExamples} />;
}
