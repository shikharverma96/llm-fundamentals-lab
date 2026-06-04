import type { Metadata } from 'next';

import { ConceptModulePage } from '@/components/concept-module-page';
import { cachingExamples } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Prompt Caching',
  description:
    '~90% discount on cached input tokens. Cache breakpoints, TTL choice, the economics, invalidation traps.',
};

export default function CachingPage(): React.ReactElement {
  return <ConceptModulePage eyebrow="Module S · Agentic AI" data={cachingExamples} />;
}
