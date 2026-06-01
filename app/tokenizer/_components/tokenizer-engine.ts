'use client';

import { getEncoding, type Tiktoken } from 'js-tiktoken';

import type { TokenizerFamily } from '@/lib/schemas/pricing';
import { TOKENIZERS } from '@/lib/tokenizer';

// Cache initialized encoders/tokenizers between renders.
const tiktokenCache = new Map<'o200k_base' | 'cl100k_base', Tiktoken>();

interface HFTokenizerLike {
  encode(text: string): number[];
  decode(ids: number[], options?: { skip_special_tokens?: boolean }): string;
  decode_single(id: number): string;
}

interface HFTransformersModule {
  AutoTokenizer: {
    from_pretrained(repo: string): Promise<HFTokenizerLike>;
  };
}

const hfCache = new Map<string, Promise<HFTokenizerLike>>();

// Loaded from CDN at runtime. Avoids bundling onnxruntime-web's ESM
// (which trips Terser on `import.meta` during static export).
const HF_CDN_URL =
  'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2/+esm';
let hfModulePromise: Promise<HFTransformersModule> | null = null;

function loadHFModule(): Promise<HFTransformersModule> {
  if (!hfModulePromise) {
    hfModulePromise = import(
      /* webpackIgnore: true */ HF_CDN_URL
    ) as Promise<HFTransformersModule>;
  }
  return hfModulePromise;
}

function getTiktoken(name: 'o200k_base' | 'cl100k_base'): Tiktoken {
  let enc = tiktokenCache.get(name);
  if (!enc) {
    enc = getEncoding(name);
    tiktokenCache.set(name, enc);
  }
  return enc;
}

async function getHF(repo: string): Promise<HFTokenizerLike> {
  let cached = hfCache.get(repo);
  if (!cached) {
    cached = (async (): Promise<HFTokenizerLike> => {
      // Loaded from CDN — keeps onnxruntime-web ESM out of webpack bundle.
      const mod = await loadHFModule();
      const tok = await mod.AutoTokenizer.from_pretrained(repo);
      return tok;
    })();
    hfCache.set(repo, cached);
  }
  return cached;
}

export interface TokenSpan {
  /** Decoded text for the token (already trimmed of leading-space markers where possible). */
  display: string;
  /** Numeric token id from the underlying tokenizer. */
  id: number;
}

export interface EngineResult {
  tokens: TokenSpan[];
  count: number;
}

/**
 * Tokenize `text` with the chosen tokenizer family. The result is suitable for
 * direct rendering: each `display` field is already a human-readable string
 * representing the token's surface form.
 */
export async function tokenizeWith(
  family: TokenizerFamily,
  text: string,
): Promise<EngineResult> {
  if (text.length === 0) return { tokens: [], count: 0 };

  const info = TOKENIZERS.find((t) => t.id === family);
  if (!info) throw new Error(`Unknown tokenizer family: ${family}`);

  if (info.tiktokenEncoding) {
    const enc = getTiktoken(info.tiktokenEncoding);
    const ids = enc.encode(text);
    const tokens: TokenSpan[] = ids.map((id) => ({
      display: enc.decode([id]),
      id,
    }));
    return { tokens, count: tokens.length };
  }

  if (!info.hfRepo) {
    throw new Error(`Tokenizer ${family} has no backing implementation`);
  }
  const tok = await getHF(info.hfRepo);
  const ids = tok.encode(text);
  const tokens: TokenSpan[] = ids.map((id) => {
    let display: string;
    try {
      display = tok.decode_single(id);
    } catch {
      display = tok.decode([id], { skip_special_tokens: false });
    }
    // SentencePiece marks leading-space with ▁; replace with a visible space.
    return { display: display.replace(/▁/g, ' '), id };
  });
  return { tokens, count: tokens.length };
}

/**
 * Count tokens only — cheaper than tokenizeWith when the visualization
 * is not needed (e.g. for the leaderboard).
 */
export async function countTokens(family: TokenizerFamily, text: string): Promise<number> {
  if (text.length === 0) return 0;
  const info = TOKENIZERS.find((t) => t.id === family);
  if (!info) throw new Error(`Unknown tokenizer family: ${family}`);
  if (info.tiktokenEncoding) {
    return getTiktoken(info.tiktokenEncoding).encode(text).length;
  }
  if (!info.hfRepo) throw new Error(`Tokenizer ${family} has no backing implementation`);
  const tok = await getHF(info.hfRepo);
  return tok.encode(text).length;
}
