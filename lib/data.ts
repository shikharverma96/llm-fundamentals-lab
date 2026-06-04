import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type {
  CostTemplatesFile,
  HallucinationExamplesFile,
  ProviderPricingFile,
  QuantizationBenchmarkFile,
} from './schemas';
import {
  CostTemplatesFileSchema,
  HallucinationExamplesFileSchema,
  ProviderPricingFileSchema,
  QuantizationBenchmarkFileSchema,
} from './schemas';
import type { AgentLoopExamplesFile } from './schemas/agent-loop';
import { AgentLoopExamplesFileSchema } from './schemas/agent-loop';
import type { ConceptModuleFile } from './schemas/concept-module';
import { ConceptModuleFileSchema } from './schemas/concept-module';
import type { RagExamplesFile } from './schemas/rag';
import { RagExamplesFileSchema } from './schemas/rag';
import type { ToolsLabFile } from './schemas/tools-lab';
import { ToolsLabFileSchema } from './schemas/tools-lab';

const DATA_DIR = path.join(process.cwd(), 'data');

function readJSON(file: string): unknown {
  const full = path.join(DATA_DIR, file);
  const raw = fs.readFileSync(full, 'utf-8');
  return JSON.parse(raw);
}

function loadOrThrow<T>(file: string, parse: (input: unknown) => T): T {
  try {
    return parse(readJSON(file));
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid data/${file}: ${reason}`);
  }
}

// Eager validation — these calls run at module-load time on the server.
// Any schema drift in data/*.json fails `next build` immediately.
export const quantizationBenchmarks: QuantizationBenchmarkFile = loadOrThrow(
  'quantization-benchmarks.json',
  (i) => QuantizationBenchmarkFileSchema.parse(i),
);

export const providerPricing: ProviderPricingFile = loadOrThrow('provider-pricing.json', (i) =>
  ProviderPricingFileSchema.parse(i),
);

export const costTemplates: CostTemplatesFile = loadOrThrow('cost-templates.json', (i) =>
  CostTemplatesFileSchema.parse(i),
);

export const hallucinationExamples: HallucinationExamplesFile = loadOrThrow(
  'hallucination-examples.json',
  (i) => HallucinationExamplesFileSchema.parse(i),
);

export const ragExamples: RagExamplesFile = loadOrThrow('rag-examples.json', (i) =>
  RagExamplesFileSchema.parse(i),
);

export const agentLoopExamples: AgentLoopExamplesFile = loadOrThrow(
  'agent-loop-examples.json',
  (i) => AgentLoopExamplesFileSchema.parse(i),
);

export const toolsLabExamples: ToolsLabFile = loadOrThrow('tools-lab-examples.json', (i) =>
  ToolsLabFileSchema.parse(i),
);

// Concept modules — same shape, different content. One loader per module.
const concept = (file: string): ConceptModuleFile =>
  loadOrThrow(file, (i) => ConceptModuleFileSchema.parse(i));

export const patternsExamples: ConceptModuleFile = concept('patterns-examples.json');
export const memoryExamples: ConceptModuleFile = concept('memory-examples.json');
export const guardrailsExamples: ConceptModuleFile = concept('guardrails-examples.json');
export const planningExamples: ConceptModuleFile = concept('planning-examples.json');
export const multiAgentExamples: ConceptModuleFile = concept('multi-agent-examples.json');
export const evalsExamples: ConceptModuleFile = concept('evals-examples.json');
export const mcpExamples: ConceptModuleFile = concept('mcp-examples.json');
export const frameworksExamples: ConceptModuleFile = concept('frameworks-examples.json');
export const computerUseExamples: ConceptModuleFile = concept('computer-use-examples.json');
export const contextExamples: ConceptModuleFile = concept('context-examples.json');
export const structuredOutputExamples: ConceptModuleFile = concept(
  'structured-output-examples.json',
);
export const cachingExamples: ConceptModuleFile = concept('caching-examples.json');
export const failureModesExamples: ConceptModuleFile = concept('failure-modes-examples.json');
