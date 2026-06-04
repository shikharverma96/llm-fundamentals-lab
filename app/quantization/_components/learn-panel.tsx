/* eslint-disable react/no-unescaped-entities */
export function LearnPanel(): React.ReactElement {
  return (
    <details className="group rounded-xl border bg-card text-card-foreground shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-6 text-lg font-semibold leading-none tracking-tight">
        <span>Learn the fundamentals · Quantization</span>
        <span
          aria-hidden
          className="text-xs font-normal text-muted-foreground transition-transform group-open:rotate-180"
        >
          ▾
        </span>
      </summary>
      <div className="space-y-6 px-6 pb-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-base font-semibold">What quantization is</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              LLM weights are usually stored as 16-bit floats (<strong>FP16</strong>). Quantization
              packs each weight into fewer bits — 8, 4, even 2 — by mapping a range of float values
              to a small set of integers.
            </li>
            <li>
              <strong>FP16</strong> ≈ 2 bytes/weight, <strong>INT8</strong> ≈ 1 byte,{' '}
              <strong>INT4</strong> ≈ 0.5 byte, <strong>INT2</strong> ≈ 0.25 byte. A 7B model goes
              from ~14 GB to ~3.5 GB at Q4.
            </li>
            <li>
              The unit is <em>bits per weight</em> (bpw). Modern formats like K-quants mix bit
              widths across layers, so you see values like 4.83 bpw rather than a clean 4.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-semibold">Why it matters</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              <strong>Memory:</strong> a Q4 7B model fits in 6 GB of RAM — runs on a MacBook or a
              consumer GPU.
            </li>
            <li>
              <strong>Throughput:</strong> smaller weights mean less memory bandwidth, the usual
              bottleneck for decode. Q4 is often 2–3× faster than FP16 on the same hardware.
            </li>
            <li>
              <strong>Edge & cost:</strong> quantized models unlock phones, Raspberry Pi, and cheap
              CPU inference — and slash cloud GPU bills.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-semibold">What it costs you</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              <strong>Perplexity</strong> (PPL) rises as bits drop. INT8 is usually within 0.1% of
              FP16; Q4_K_M loses 1–3%; Q2_K can lose 10%+ and produce visibly worse text.
            </li>
            <li>
              <strong>MMLU</strong> and other reasoning benchmarks drop faster than PPL — small
              models suffer disproportionately under aggressive quantization.
            </li>
            <li>
              Output quality degrades non-uniformly: code, math, and long-form coherence break
              before casual chat does.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-semibold">When to pick which</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              <strong>FP16 / BF16</strong> — cloud server with a real GPU, accuracy matters, you're
              serving paying users. Default for production training and eval.
            </li>
            <li>
              <strong>Q4_K_M / Q5_K_M</strong> — M-series laptop, mid-tier desktop GPU, on-device
              apps. The sweet spot: ~95% of FP16 quality at ~25% of the size.
            </li>
            <li>
              <strong>Q2_K / Q3_K</strong> — Raspberry Pi, phone, demo on a potato. Expect
              noticeable quality loss; only viable for small smart-reply or autocomplete tasks.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-semibold">Pitfalls</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              <strong>Calibration data matters.</strong> GPTQ/AWQ use a calibration set; a
              mismatched one (English-only when you serve Japanese) tanks quality.
            </li>
            <li>
              <strong>Outlier weights</strong> break naive round-to-nearest. LLM.int8(), AWQ, and
              SmoothQuant exist precisely to handle them.
            </li>
            <li>
              <strong>Per-channel vs per-tensor</strong> scales: per-channel keeps accuracy,
              per-tensor is cheaper but lossier — most modern quantizers use per-channel/per-group.
            </li>
            <li>
              <strong>Weight vs activation</strong> quantization are different problems. Weight-only
              (GPTQ, AWQ) is the easy win; full INT8 inference (activations too) requires more care.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-semibold">Glossary</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              <strong>PPL</strong> — perplexity. Lower = better. The model's surprise on a held-out
              text.
            </li>
            <li>
              <strong>MMLU</strong> — Massive Multitask Language Understanding. 57-subject
              multiple-choice benchmark, standard sanity check.
            </li>
            <li>
              <strong>GGUF</strong> — single-file model format used by llama.cpp; the de-facto
              container for quantized open-weight models.
            </li>
            <li>
              <strong>K-quants</strong> — llama.cpp's mixed-precision schemes (Q2_K, Q3_K, Q4_K_M,
              etc.) that use different bit widths per layer.
            </li>
            <li>
              <strong>AWQ</strong> — Activation-aware Weight Quantization. Scales weights based on
              activation magnitudes; very popular for 4-bit.
            </li>
            <li>
              <strong>GPTQ</strong> — one-shot post-training quantization via approximate
              second-order error minimization. Battle-tested for INT4.
            </li>
            <li>
              <strong>bitsandbytes</strong> — Python library that gives you INT8/INT4 inference in
              PyTorch with one flag.
            </li>
          </ul>
        </section>
      </div>
    </details>
  );
}
