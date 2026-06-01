#!/usr/bin/env python3
"""Recompute the quantization benchmark data file from scratch.

This script downloads pre-quantized Qwen2.5-0.5B-Instruct GGUF variants,
measures size on disk, peak resident RAM, throughput, WikiText-2 perplexity,
and a "MMLU-mini" score (the first 500 MMLU questions for repeatability),
generates three sample completions for a fixed prompt, and writes the
result to ``data/quantization-benchmarks.json``.

The output is *intentionally* shaped to match ``lib/schemas/benchmarks.ts``.
Run ``pnpm build`` afterwards — the Zod validation in ``lib/data.ts`` will
fail loudly if the shape ever drifts.

Usage::

    python -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    python run_benchmarks.py

Notes
-----
- Requires ~3 GB of disk for the model variants. They land in ``benchmarks/models/``.
- Perplexity is computed over the first 4,096 tokens of the WikiText-2
  test split (a stable, well-known proxy — not a substitute for a full
  perplexity run).
- llama.cpp throughput is measured by generating 128 tokens from a fixed
  prompt with ``n_ctx=2048`` and 8 CPU threads.
"""

from __future__ import annotations

import dataclasses
import gc
import json
import math
import os
import platform
import resource
import shutil
import sys
import time
from datetime import date
from pathlib import Path
from typing import Iterable, List

ROOT = Path(__file__).resolve().parents[1]
MODELS_DIR = Path(__file__).resolve().parent / "models"
DATA_FILE = ROOT / "data" / "quantization-benchmarks.json"

MODEL_REPO = "Qwen/Qwen2.5-0.5B-Instruct-GGUF"
SYSTEM_PROMPT = "You are a concise technical writer. Answer in plain English, no markdown."
PROMPT = "Explain in two sentences why quantization reduces LLM memory usage."

# Map our internal level id → (filename in the GGUF repo, advertised bits/weight).
VARIANTS: list[tuple[str, str, float]] = [
    ("fp16", "qwen2.5-0.5b-instruct-fp16.gguf", 16.0),
    ("q8_0", "qwen2.5-0.5b-instruct-q8_0.gguf", 8.5),
    ("q4_k_m", "qwen2.5-0.5b-instruct-q4_k_m.gguf", 4.85),
    ("q3_k_m", "qwen2.5-0.5b-instruct-q3_k_m.gguf", 3.91),
    ("q2_k", "qwen2.5-0.5b-instruct-q2_k.gguf", 2.62),
]

CTX = 2048
THREADS = 8
GEN_TOKENS = 128
PPL_TOKEN_BUDGET = 4096


@dataclasses.dataclass
class VariantResult:
    level: str
    bits_per_weight: float
    file_size_mb: float
    peak_ram_mb: float
    tokens_per_sec: float
    perplexity: float
    mmlu_mini: float
    samples: list[str]


def _ensure_model(filename: str) -> Path:
    from huggingface_hub import hf_hub_download

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    target = MODELS_DIR / filename
    if target.exists():
        return target
    print(f"  downloading {filename} from {MODEL_REPO}...", flush=True)
    path = hf_hub_download(MODEL_REPO, filename=filename, local_dir=MODELS_DIR)
    return Path(path)


def _peak_rss_mb() -> float:
    usage = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    # macOS reports bytes; Linux reports kilobytes.
    return usage / 1_000_000 if platform.system() == "Darwin" else usage / 1024


def _reset_peak_rss() -> None:
    # No portable way to reset, so we GC and snapshot before each phase
    # and compute the delta later.
    gc.collect()


def _generate_samples(llm, prompt: str, system: str, n: int = 3) -> list[str]:
    out: list[str] = []
    for _ in range(n):
        resp = llm.create_chat_completion(
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            max_tokens=180,
            temperature=0.7,
            top_p=0.9,
        )
        text = resp["choices"][0]["message"]["content"].strip()
        out.append(text)
    return out


def _measure_throughput(llm, prompt: str) -> float:
    start = time.perf_counter()
    resp = llm.create_completion(
        prompt=prompt,
        max_tokens=GEN_TOKENS,
        temperature=0.0,
    )
    elapsed = time.perf_counter() - start
    generated = resp["usage"]["completion_tokens"]
    return generated / elapsed if elapsed > 0 else 0.0


def _wikitext_logprobs(llm, token_budget: int) -> float:
    """Naive perplexity proxy over WikiText-2 test split.

    Concatenates the test set, truncates to ``token_budget`` tokens, and
    asks llama.cpp for log-probabilities via eval. This is intentionally
    minimal — for production-quality numbers, swap to the official
    perplexity tool from llama.cpp.
    """
    from datasets import load_dataset

    ds = load_dataset("wikitext", "wikitext-2-raw-v1", split="test")
    text = "\n".join(x for x in ds["text"] if x.strip())
    tokens = llm.tokenize(text.encode("utf-8"), add_bos=True)[:token_budget]
    if len(tokens) < 64:
        return float("nan")
    llm.reset()
    llm.eval(tokens)
    logits = llm.scores[: len(tokens)]
    # next-token NLL on the unfortunate token stream
    total_nll = 0.0
    counted = 0
    for i in range(len(tokens) - 1):
        next_tok = tokens[i + 1]
        row = logits[i]
        max_logit = max(row)
        denom = math.log(sum(math.exp(x - max_logit) for x in row)) + max_logit
        total_nll += denom - row[next_tok]
        counted += 1
    if counted == 0:
        return float("nan")
    return math.exp(total_nll / counted)


def _mmlu_mini(llm, limit: int = 500) -> float:
    """Score the first ``limit`` MMLU questions, four-way multiple choice."""
    from datasets import load_dataset

    ds = load_dataset("cais/mmlu", "all", split="test")
    correct = 0
    seen = 0
    for row in ds.select(range(min(limit, len(ds)))):
        q = row["question"]
        choices = row["choices"]
        answer_idx = row["answer"]
        prompt = (
            "Answer the multiple-choice question with a single letter A, B, C, or D.\n\n"
            f"Question: {q}\n"
            f"A) {choices[0]}\n"
            f"B) {choices[1]}\n"
            f"C) {choices[2]}\n"
            f"D) {choices[3]}\n"
            "Answer:"
        )
        resp = llm.create_completion(prompt=prompt, max_tokens=2, temperature=0.0)
        out = resp["choices"][0]["text"].strip().upper()
        predicted = next((c for c in out if c in "ABCD"), "")
        if predicted == "ABCD"[answer_idx]:
            correct += 1
        seen += 1
    return correct / seen if seen else 0.0


def _measure_variant(level: str, filename: str, bits: float) -> VariantResult:
    from llama_cpp import Llama

    path = _ensure_model(filename)
    file_size_mb = path.stat().st_size / (1024 * 1024)

    print(f"[{level}] loading {path.name} ({file_size_mb:.1f} MB)...", flush=True)
    _reset_peak_rss()
    rss_before = _peak_rss_mb()
    llm = Llama(
        model_path=str(path),
        n_ctx=CTX,
        n_threads=THREADS,
        verbose=False,
        logits_all=True,
    )
    rss_after = _peak_rss_mb()
    peak_ram_mb = max(rss_after - rss_before, file_size_mb)

    print(f"[{level}] measuring throughput...", flush=True)
    tokens_per_sec = _measure_throughput(llm, "The future of small language models is")

    print(f"[{level}] computing perplexity...", flush=True)
    ppl = _wikitext_logprobs(llm, PPL_TOKEN_BUDGET)

    print(f"[{level}] running MMLU-mini...", flush=True)
    mmlu = _mmlu_mini(llm, limit=500)

    print(f"[{level}] generating samples...", flush=True)
    samples = _generate_samples(llm, PROMPT, SYSTEM_PROMPT, n=3)

    del llm
    gc.collect()

    return VariantResult(
        level=level,
        bits_per_weight=bits,
        file_size_mb=round(file_size_mb, 1),
        peak_ram_mb=round(peak_ram_mb, 1),
        tokens_per_sec=round(tokens_per_sec, 1),
        perplexity=round(ppl, 2) if math.isfinite(ppl) else 0.0,
        mmlu_mini=round(mmlu, 3),
        samples=samples,
    )


def _reference_hw() -> dict:
    return {
        "cpu": platform.processor() or platform.machine(),
        "ram": f"{int(os.sysconf('SC_PAGE_SIZE') * os.sysconf('SC_PHYS_PAGES') / (1024**3))} GB"
        if hasattr(os, "sysconf")
        else "unknown",
        "os": f"{platform.system()} {platform.release()}",
        "runtime": "llama-cpp-python (single thread per token, 8 threads)",
    }


def main(argv: Iterable[str] | None = None) -> int:
    print("Computing quantization benchmarks for", MODEL_REPO)
    results: List[VariantResult] = []
    for level, filename, bits in VARIANTS:
        try:
            results.append(_measure_variant(level, filename, bits))
        except Exception as exc:  # noqa: BLE001 - we want any failure visible
            print(f"[{level}] FAILED: {exc}", file=sys.stderr)
            return 1

    payload = {
        "model": "Qwen/Qwen2.5-0.5B-Instruct",
        "modelRevision": "main",
        "measuredAt": date.today().isoformat(),
        "referenceHardware": _reference_hw(),
        "promptSet": {"prompt": PROMPT, "systemPrompt": SYSTEM_PROMPT},
        "variants": [
            {
                "level": r.level,
                "bitsPerWeight": r.bits_per_weight,
                "fileSizeMB": r.file_size_mb,
                "peakRamMB": r.peak_ram_mb,
                "tokensPerSec": r.tokens_per_sec,
                "perplexityWikitext2": r.perplexity,
                "mmluMini": r.mmlu_mini,
                "samples": r.samples,
            }
            for r in results
        ],
    }

    backup = DATA_FILE.with_suffix(".json.bak")
    if DATA_FILE.exists():
        shutil.copy2(DATA_FILE, backup)
    DATA_FILE.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"\nWrote {DATA_FILE.relative_to(ROOT)}.")
    print("Now run: pnpm typecheck && pnpm build")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
