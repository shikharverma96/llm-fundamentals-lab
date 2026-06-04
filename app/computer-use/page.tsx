import type { Metadata } from 'next';

import { ConceptModulePage } from '@/components/concept-module-page';
import { computerUseExamples } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Computer / Browser Use',
  description:
    'Vision-grounded vs DOM-grounded action spaces. Why an API is almost always the right answer, and the decision prompt that proves it.',
};

export default function ComputerUsePage(): React.ReactElement {
  return <ConceptModulePage eyebrow="Module P · Agentic AI" data={computerUseExamples} />;
}
