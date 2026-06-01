import type { ProviderModel } from './schemas';

export interface UsageAssumptions {
  inputTokensPerRequest: number;
  outputTokensPerRequest: number;
  requestsPerDay: number;
}

export interface CostBreakdown {
  /** Cost of input tokens over 30 days, in USD. */
  inputUSD: number;
  /** Cost of output tokens over 30 days, in USD. */
  outputUSD: number;
  /** Combined monthly cost in USD (30 days). */
  monthlyUSD: number;
  /** Cost of one request, in USD. */
  perRequestUSD: number;
  /** Cost per 1,000 requests, in USD. */
  perThousandRequestsUSD: number;
}

/**
 * Pure cost calculation. Prices are given per 1,000,000 tokens (industry convention).
 * Monthly cost assumes a 30-day month, matching most provider invoicing pages.
 */
export function calculateCost(
  model: Pick<ProviderModel, 'inputPricePer1M' | 'outputPricePer1M'>,
  usage: UsageAssumptions,
): CostBreakdown {
  const { inputPricePer1M, outputPricePer1M } = model;
  const { inputTokensPerRequest, outputTokensPerRequest, requestsPerDay } = usage;

  const perRequestInput = (inputTokensPerRequest * inputPricePer1M) / 1_000_000;
  const perRequestOutput = (outputTokensPerRequest * outputPricePer1M) / 1_000_000;
  const perRequestUSD = perRequestInput + perRequestOutput;

  const monthlyRequests = requestsPerDay * 30;
  const inputUSD = perRequestInput * monthlyRequests;
  const outputUSD = perRequestOutput * monthlyRequests;

  return {
    inputUSD,
    outputUSD,
    monthlyUSD: inputUSD + outputUSD,
    perRequestUSD,
    perThousandRequestsUSD: perRequestUSD * 1000,
  };
}

export interface ScoredModel {
  model: ProviderModel;
  cost: CostBreakdown;
}

export function scoreModels(models: readonly ProviderModel[], usage: UsageAssumptions): ScoredModel[] {
  return models.map((model) => ({ model, cost: calculateCost(model, usage) }));
}
