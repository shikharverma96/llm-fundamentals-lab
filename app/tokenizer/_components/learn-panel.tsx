/* eslint-disable react/no-unescaped-entities */
export function LearnPanel(): React.ReactElement {
  return (
    <details className="group rounded-xl border bg-card text-card-foreground shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-6 text-lg font-semibold leading-none tracking-tight">
        <span>Learn the fundamentals · Tokenizers</span>
        <span
          aria-hidden
          className="text-xs font-normal text-muted-foreground transition-transform group-open:rotate-180"
        >
          ▾
        </span>
      </summary>
      <div className="space-y-6 px-6 pb-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-base font-semibold">What a tokenizer is</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              An LLM doesn&apos;t see characters or words — it sees <strong>tokens</strong>, integer
              IDs from a fixed vocabulary (typically 32k–200k entries).
            </li>
            <li>
              Most tokens are <em>subwords</em>: common words map to one token (
              <code>&quot; the&quot;</code>), rarer words split (
              <code>&quot; tokeniz&quot; + &quot;ation&quot;</code>), gibberish breaks down to
              bytes.
            </li>
            <li>
              Three families dominate: <strong>BPE</strong> (GPT, Llama 3, Mistral),{' '}
              <strong>SentencePiece/Unigram</strong> (Llama 2, Gemma, T5),{' '}
              <strong>WordPiece</strong> (BERT-era).
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-semibold">Why token count is your bill</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              Every commercial API prices per <strong>million tokens</strong>, input and output
              billed separately. Token count = literal dollars.
            </li>
            <li>
              Token count also = your <strong>context window budget</strong>. A 128k-window model
              with a wasteful tokenizer effectively has less room for content.
            </li>
            <li>
              Output tokens are usually 3–5× the input price. Long completions and chain-of-thought
              explode cost fast.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-semibold">Why tokenizers differ across families</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              <strong>Training corpus:</strong> a tokenizer trained on English news will split Hindi
              or Korean into many short tokens; one trained on multilingual data won't.
            </li>
            <li>
              <strong>Vocab size:</strong> bigger vocab (cl100k → o200k) compresses common text
              further, at the cost of larger embedding tables.
            </li>
            <li>
              <strong>Byte-level vs piece-level:</strong> byte-level BPE (GPT) handles any UTF-8
              input; piece-level tokenizers may fall back to {'<unk>'} for unfamiliar scripts.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-semibold">Where the variance bites</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              Same English paragraph: GPT-4o tokenizer might use 80 tokens, Llama 3 ~85, Gemma ~95 —
              modest spread.
            </li>
            <li>
              <strong>Code</strong> and <strong>code comments:</strong> code-aware tokenizers
              (o200k, CodeLlama) win big — up to 30% fewer tokens than general-purpose ones.
            </li>
            <li>
              <strong>Emoji / CJK / Arabic / Hindi:</strong> a tokenizer not trained on them can
              balloon token counts 2–4×. Same content, double the bill.
            </li>
            <li>
              <strong>ALL CAPS</strong> and unusual whitespace often tokenize one-char-at-a-time —
              another silent cost.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-semibold">Pitfalls</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              <strong>Leading-space tokens.</strong> {'"hello"'} and {'" hello"'} are different
              tokens. Concatenating strings manually creates subtle bugs.
            </li>
            <li>
              <strong>BOM / hidden Unicode.</strong> A copy-pasted BOM or zero-width space adds a
              token and silently changes model behavior.
            </li>
            <li>
              <strong>Special tokens</strong> like <code>{'<|endoftext|>'}</code>,{' '}
              <code>{'<|im_start|>'}</code>, <code>[INST]</code> control generation. Never let user
              input contain them raw — it's a prompt-injection vector.
            </li>
            <li>
              <strong>Vocabulary attacks:</strong> "glitch tokens" (e.g.{' '}
              <code>SolidGoldMagikarp</code>) — rare tokens the model never learned — can produce
              bizarre outputs.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-semibold">Glossary</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              <strong>BPE</strong> — Byte Pair Encoding. Greedily merges the most frequent adjacent
              pairs to build the vocab.
            </li>
            <li>
              <strong>SentencePiece</strong> — language-agnostic tokenizer trainer; supports BPE and
              Unigram. Treats input as a raw byte stream.
            </li>
            <li>
              <strong>Vocab</strong> — the fixed list of tokens the model knows. Embedding-matrix
              rows = vocab size.
            </li>
            <li>
              <strong>tiktoken</strong> — OpenAI's Rust BPE library, with JS port{' '}
              <code>js-tiktoken</code>. Encodings: <code>cl100k_base</code> (GPT-4),{' '}
              <code>o200k_base</code> (GPT-4o).
            </li>
            <li>
              <strong>AutoTokenizer</strong> — HuggingFace <code>transformers</code> entry point
              that loads any model's tokenizer by name.
            </li>
            <li>
              <strong>Context window</strong> — max tokens the model can attend to in one forward
              pass (input + output combined for most APIs).
            </li>
            <li>
              <strong>Completion tokens</strong> — tokens the model generates. Billed separately and
              usually more expensive than prompt tokens.
            </li>
          </ul>
        </section>
      </div>
    </details>
  );
}
