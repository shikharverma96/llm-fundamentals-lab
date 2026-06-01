import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type {
  CostTemplatesFile,
  ProviderPricingFile,
  QuantizationBenchmarkFile,
} from './schemas';
import {
  CostTemplatesFileSchema,
  ProviderPricingFileSchema,
  QuantizationBenchmarkFileSchema,
} from './schemas';

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

export const providerPricing: ProviderPricingFile = loadOrThrow(
  'provider-pricing.json',
  (i) => ProviderPricingFileSchema.parse(i),
);

export const costTemplates: CostTemplatesFile = loadOrThrow('cost-templates.json', (i) =>
  CostTemplatesFileSchema.parse(i),
);
