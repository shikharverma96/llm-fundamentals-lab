import { describe, expect, it } from 'vitest';

import { calculateCost, scoreModels } from '@/lib/cost-engine';
import type { ProviderModel } from '@/lib/schemas/pricing';

const sampleModel = (overrides: Partial<ProviderModel> = {}): ProviderModel => ({
  id: 'test-model',
  provider: 'openai',
  modelLabel: 'Test',
  inputPricePer1M: 2.5,
  outputPricePer1M: 10.0,
  p50LatencyMs: 500,
  privacy: 'cloud',
  contextWindow: 128000,
  tokenizer: 'o200k_base',
  ...overrides,
});

describe('calculateCost', () => {
  it('computes monthly cost using a 30-day month', () => {
    const cost = calculateCost(
      { inputPricePer1M: 1, outputPricePer1M: 2 },
      { inputTokensPerRequest: 1_000_000, outputTokensPerRequest: 0, requestsPerDay: 1 },
    );
    // 1 USD per request input, 30 requests/month => 30 USD
    expect(cost.inputUSD).toBeCloseTo(30, 6);
    expect(cost.outputUSD).toBeCloseTo(0, 6);
    expect(cost.monthlyUSD).toBeCloseTo(30, 6);
    expect(cost.perRequestUSD).toBeCloseTo(1, 6);
    expect(cost.perThousandRequestsUSD).toBeCloseTo(1000, 6);
  });

  it('adds input and output token contributions', () => {
    const cost = calculateCost(
      { inputPricePer1M: 5, outputPricePer1M: 15 },
      { inputTokensPerRequest: 400, outputTokensPerRequest: 250, requestsPerDay: 5000 },
    );
    // per request: (400 * 5 + 250 * 15) / 1e6 = (2000 + 3750) / 1e6 = 0.00575
    expect(cost.perRequestUSD).toBeCloseTo(0.00575, 8);
    // monthly: 0.00575 * 5000 * 30 = 862.5
    expect(cost.monthlyUSD).toBeCloseTo(862.5, 4);
  });

  it('returns zero when usage is zero', () => {
    const cost = calculateCost(
      { inputPricePer1M: 10, outputPricePer1M: 30 },
      { inputTokensPerRequest: 0, outputTokensPerRequest: 0, requestsPerDay: 0 },
    );
    expect(cost.monthlyUSD).toBe(0);
    expect(cost.perRequestUSD).toBe(0);
  });

  it('handles free (on-device) models cleanly', () => {
    const cost = calculateCost(
      { inputPricePer1M: 0, outputPricePer1M: 0 },
      { inputTokensPerRequest: 1000, outputTokensPerRequest: 500, requestsPerDay: 10000 },
    );
    expect(cost.monthlyUSD).toBe(0);
  });
});

describe('scoreModels', () => {
  it('returns one row per model with cost', () => {
    const models: ProviderModel[] = [
      sampleModel({ id: 'a', inputPricePer1M: 1, outputPricePer1M: 1 }),
      sampleModel({ id: 'b', inputPricePer1M: 10, outputPricePer1M: 10 }),
    ];
    const out = scoreModels(models, {
      inputTokensPerRequest: 1000,
      outputTokensPerRequest: 500,
      requestsPerDay: 100,
    });
    expect(out).toHaveLength(2);
    expect(out[0]!.model.id).toBe('a');
    expect(out[1]!.cost.monthlyUSD).toBeGreaterThan(out[0]!.cost.monthlyUSD);
  });
});
