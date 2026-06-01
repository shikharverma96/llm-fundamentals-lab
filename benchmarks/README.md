# Quantization benchmark harness

This directory regenerates `data/quantization-benchmarks.json` from real measurements.

## Why a separate harness?

The web app is fully static — it ships a committed JSON snapshot. Numbers come
from this Python script, which:

1. Downloads Qwen2.5-0.5B-Instruct GGUF variants from Hugging Face (`Qwen/Qwen2.5-0.5B-Instruct-GGUF`).
2. Loads each variant via `llama-cpp-python` and measures:
   - File size on disk
   - Peak resident memory delta vs the parent process
   - Tokens-per-second on a fixed 128-token generation
   - Perplexity over the first 4,096 tokens of WikiText-2 test
   - "MMLU-mini": accuracy on the first 500 MMLU multiple-choice questions
   - Three sample completions to a fixed prompt
3. Writes the result back to `data/quantization-benchmarks.json` in the
   exact shape `lib/schemas/benchmarks.ts` validates against.

Run `pnpm build` after to confirm — Zod validation in `lib/data.ts` fails
the build if anything drifts.

## Run it

```bash
cd benchmarks
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run_benchmarks.py
```

Expect ~3 GB of disk usage in `benchmarks/models/` for the cached GGUF files
and 20–40 minutes of wall time on an M2 / 16 GB depending on the variant.

## Important caveats

- Perplexity here is a quick proxy — the official llama.cpp `perplexity`
  tool gives more precise numbers for headline reporting.
- Peak RAM is `RUSAGE_SELF` delta around model load. It approximates working
  set, not heap precision.
- MMLU score is over the first 500 questions only for repeatability and
  speed; it tracks the full benchmark closely for small models.
- Numbers vary across CPUs and llama.cpp builds. Always report the hardware
  block alongside the metrics. The script auto-captures hardware info.

## Committing updates

After a successful run:

```bash
git add data/quantization-benchmarks.json
git commit -m "chore(data): refresh quantization benchmarks"
```

A backup of the previous file is left at `data/quantization-benchmarks.json.bak`.
