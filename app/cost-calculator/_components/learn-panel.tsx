/* eslint-disable react/no-unescaped-entities */
export function LearnPanel(): React.ReactElement {
  return (
    <details className="group rounded-xl border bg-card text-card-foreground shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-6 text-lg font-semibold leading-none tracking-tight">
        <span>Learn the fundamentals · LLM economics</span>
        <span
          aria-hidden
          className="text-xs font-normal text-muted-foreground transition-transform group-open:rotate-180"
        >
          ▾
        </span>
      </summary>
      <div className="space-y-6 px-6 pb-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-base font-semibold">How LLM pricing works</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              You pay per <strong>token</strong>, quoted as USD per <strong>million tokens</strong>.
              Input and output are billed separately — output is 3–5× input on most providers.
            </li>
            <li>
              <strong>Hidden costs:</strong> system prompts, conversation history replayed on every
              turn, tool-call schemas, embeddings for retrieval, vector DB hosting, retries on rate
              limits.
            </li>
            <li>
              Prompt caching (Anthropic, OpenAI) and batch APIs (50% off, async) materially change
              the math — always check whether your workload qualifies.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-semibold">Latency vs cost vs quality</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              These three are a triangle. Frontier models (GPT-4o, Claude Opus, Gemini Pro) lead on
              quality, lag on latency, dominate cost.
            </li>
            <li>
              <strong>Small/fast tier</strong> (GPT-4o mini, Claude Haiku, Gemini Flash): ~10–20×
              cheaper, ~3× faster, quality good enough for most classification, extraction, and
              simple chat.
            </li>
            <li>
              <strong>Time-to-first-token</strong> (TTFT) matters more than total latency for chat
              UX — streaming hides total cost.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-semibold">Cheap model + retrieval vs frontier model</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              For factual / knowledge-bound tasks: a small model with good RAG often beats a
              frontier model with no retrieval — and costs a tenth.
            </li>
            <li>
              For reasoning, code, planning, multi-step tool use: frontier still wins. RAG can't fix
              bad reasoning.
            </li>
            <li>
              <strong>Rule of thumb:</strong> if you can phrase the task as "find the answer in
              these docs", small + RAG. If it's "figure out what to do next", frontier.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-semibold">On-device vs API economics</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              Self-hosting wins on cost only at <strong>sustained, high</strong> volume (millions of
              tokens/day per GPU). Below that, the GPU sits idle and APIs win.
            </li>
            <li>
              Self-hosting wins on <strong>privacy, latency, and offline</strong> at any scale —
              that's often the actual reason, not cost.
            </li>
            <li>
              On-device (laptop, phone) is zero marginal cost but caps quality at whatever a 4-bit
              7B–8B model can do.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-semibold">Worked example · chatbot at 10k req/day</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              Assume 500 input + 300 output tokens per request, 30 days/month = 9M input + 5.4M
              output tokens.
            </li>
            <li>
              <strong>GPT-4o</strong> ($2.50 / $10 per Mtok): ~$22.50 + $54 ≈{' '}
              <strong>$77/mo</strong>.
            </li>
            <li>
              <strong>GPT-4o mini</strong> ($0.15 / $0.60): ~$1.35 + $3.24 ≈{' '}
              <strong>$4.60/mo</strong>.
            </li>
            <li>
              <strong>Claude Sonnet</strong> ($3 / $15): ~$27 + $81 ≈ <strong>$108/mo</strong>.
            </li>
            <li>
              <strong>Claude Haiku</strong> ($0.25 / $1.25): ~$2.25 + $6.75 ≈ <strong>$9/mo</strong>
              .
            </li>
            <li>
              <strong>Gemini 1.5 Flash</strong> ($0.075 / $0.30): ~$0.68 + $1.62 ≈{' '}
              <strong>$2.30/mo</strong>.
            </li>
            <li>
              <strong>On-device (Llama 3 8B Q4 on a Mac)</strong>: $0 marginal, but you eat the
              device cost and capped quality.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-semibold">Pitfalls</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              <strong>Forgetting the system prompt.</strong> A 2k-token system prompt × 10k req/day
              = 20M extra input tokens/day. People miss this.
            </li>
            <li>
              <strong>Chain-of-thought / reasoning models</strong> emit hidden reasoning tokens that
              you're still billed for. Output cost can 5–10×.
            </li>
            <li>
              <strong>Retries multiply cost.</strong> A 5% retry rate is a 5% surcharge. Backoff and
              idempotency keys matter.
            </li>
            <li>
              <strong>Rate limits</strong> (TPM, RPM) cap throughput before they cap budget. Test at
              peak before you ship.
            </li>
            <li>
              <strong>Batch APIs</strong> cut cost 50% — use them for any non-interactive job
              (evals, backfills, embeddings).
            </li>
            <li>
              <strong>Prompt caching</strong> can turn a 2k-token system prompt from a tax into a
              rounding error — but only if the prefix is stable.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-semibold">Glossary</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              <strong>TPM / RPM</strong> — tokens-per-minute, requests-per-minute. Provider rate
              limits.
            </li>
            <li>
              <strong>Prompt caching</strong> — provider stores the KV cache of a stable prefix; you
              pay ~10% on cache hits instead of full input price.
            </li>
            <li>
              <strong>Batch API</strong> — submit a JSONL of requests, get results within 24h, pay
              50%. Great for evals and pipelines.
            </li>
            <li>
              <strong>KV cache</strong> — the model's per-token attention state. Reused across turns
              within a session; the thing prompt caching persists.
            </li>
            <li>
              <strong>FLOPs</strong> — floating-point ops per token. Roughly{' '}
              <code>2 × params × tokens</code>. The hard floor on what self-hosting can cost.
            </li>
          </ul>
        </section>
      </div>
    </details>
  );
}
