import { describe, expect, it } from 'vitest';

import {
  projectedCostPer1kRequests,
  rankByCompactness,
  TOKENIZERS,
} from '@/lib/tokenizer';

describe('TOKENIZERS registry', () => {
  it('covers the five required families', () => {
    const ids = TOKENIZERS.map((t) => t.id);
    expect(ids).toEqual(
      expect.arrayContaining(['o200k_base', 'cl100k_base', 'llama3', 'mistral', 'gemma']),
    );
  });

  it('has a backing implementation for every family', () => {
    for (const t of TOKENIZERS) {
      const hasImpl = t.tiktokenEncoding !== null || t.hfRepo !== null;
      expect(hasImpl, `${t.id} has no backing impl`).toBe(true);
    }
  });
});

describe('rankByCompactness', () => {
  it('ranks lowest token count as best (rank 0)', () => {
    const rows = rankByCompactness(
      [
        { tokenizer: 'cl100k_base', count: 120 },
        { tokenizer: 'o200k_base', count: 80 },
        { tokenizer: 'llama3', count: 100 },
      ],
      'a'.repeat(400),
    );
    expect(rows[0]!.tokenizer).toBe('o200k_base');
    expect(rows[0]!.rank).toBe(0);
    expect(rows[2]!.tokenizer).toBe('cl100k_base');
  });

  it('computes chars-per-token correctly', () => {
    const rows = rankByCompactness([{ tokenizer: 'o200k_base', count: 50 }], 'a'.repeat(200));
    expect(rows[0]!.charsPerToken).toBe(4);
  });

  it('handles empty text without crashing', () => {
    const rows = rankByCompactness([{ tokenizer: 'o200k_base', count: 0 }], '');
    expect(rows).toHaveLength(1);
    expect(rows[0]!.charsPerToken).toBe(0);
  });
});

describe('projectedCostPer1kRequests', () => {
  it('multiplies per-request cost by 1000', () => {
    // 1000 input tokens at $1 / 1M = $0.001 per request → $1 / 1k requests
    const c = projectedCostPer1kRequests(1000, 0, 1, 0);
    expect(c).toBeCloseTo(1, 8);
  });

  it('adds output contribution', () => {
    const c = projectedCostPer1kRequests(1000, 500, 2, 6);
    // per request = (1000*2 + 500*6) / 1e6 = 0.005
    // per 1k = 5
    expect(c).toBeCloseTo(5, 8);
  });
});
