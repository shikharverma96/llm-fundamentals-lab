import type { TokenizerFamily } from './schemas/pricing';

export interface TokenizerInfo {
  id: TokenizerFamily;
  label: string;
  /** Short pedigree string ("OpenAI", "Meta", etc.) for the leaderboard. */
  vendor: string;
  /** Models that use this tokenizer family — purely descriptive. */
  representativeModels: string[];
  /** Hugging Face repo id used by @huggingface/transformers, or null if tiktoken-only. */
  hfRepo: string | null;
  /** tiktoken encoding name, or null if HF-only. */
  tiktokenEncoding: 'o200k_base' | 'cl100k_base' | null;
}

export const TOKENIZERS: readonly TokenizerInfo[] = [
  {
    id: 'o200k_base',
    label: 'GPT-4o (o200k_base)',
    vendor: 'OpenAI',
    representativeModels: ['GPT-4o', 'GPT-4o mini'],
    hfRepo: null,
    tiktokenEncoding: 'o200k_base',
  },
  {
    id: 'cl100k_base',
    label: 'GPT-3.5 / GPT-4 (cl100k_base)',
    vendor: 'OpenAI',
    representativeModels: ['GPT-4', 'GPT-3.5', 'Claude (approx)'],
    hfRepo: null,
    tiktokenEncoding: 'cl100k_base',
  },
  {
    id: 'llama3',
    label: 'Llama 3',
    vendor: 'Meta',
    representativeModels: ['Llama 3.x', 'Llama 3.1 70B'],
    hfRepo: 'Xenova/llama3-tokenizer-new',
    tiktokenEncoding: null,
  },
  {
    id: 'mistral',
    label: 'Mistral',
    vendor: 'Mistral AI',
    representativeModels: ['Mixtral 8x7B', 'Mistral 7B'],
    hfRepo: 'Xenova/mistral-tokenizer',
    tiktokenEncoding: null,
  },
  {
    id: 'gemma',
    label: 'Gemma / Gemini',
    vendor: 'Google',
    representativeModels: ['Gemma 2', 'Gemini 1.5'],
    hfRepo: 'Xenova/gemma-tokenizer',
    tiktokenEncoding: null,
  },
] as const;

export interface TokenizationResult {
  tokenizer: TokenizerFamily;
  /** Decoded token strings, in order. Used for rendering the colored visualization. */
  tokens: string[];
  /** Number of tokens. */
  count: number;
}

export interface TokenizerComparisonRow {
  tokenizer: TokenizerFamily;
  label: string;
  count: number;
  charsPerToken: number;
  /** Lower is better — index 0 = most compact. */
  rank: number;
}

/**
 * Rank tokenizers by token count for a given text. The most compact tokenizer (fewest tokens)
 * gets rank 0.
 */
export function rankByCompactness(
  results: ReadonlyArray<{ tokenizer: TokenizerFamily; count: number }>,
  text: string,
): TokenizerComparisonRow[] {
  const chars = text.length || 1;
  const sorted = [...results].sort((a, b) => a.count - b.count);
  return sorted.map((r, idx) => {
    const info = TOKENIZERS.find((t) => t.id === r.tokenizer);
    return {
      tokenizer: r.tokenizer,
      label: info?.label ?? r.tokenizer,
      count: r.count,
      charsPerToken: r.count === 0 ? 0 : chars / r.count,
      rank: idx,
    };
  });
}

/**
 * Pure helper: cost per 1,000 requests given a token count for the input text and an output
 * estimate. Used in the playground's cost-projection panel.
 */
export function projectedCostPer1kRequests(
  inputTokens: number,
  outputTokens: number,
  inputPricePer1M: number,
  outputPricePer1M: number,
): number {
  const perRequest =
    (inputTokens * inputPricePer1M) / 1_000_000 + (outputTokens * outputPricePer1M) / 1_000_000;
  return perRequest * 1000;
}
