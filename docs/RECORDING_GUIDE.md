# Recording guide

This guide is how the GIFs and screenshots in the README are produced. Keep clips short, deliberate, and 1080p.

## Tools

| Tool | Platform | Best for | Cost |
|---|---|---|---|
| [Kap](https://getkap.co) | macOS | Quick GIFs, low effort | Free, open source |
| [Screen Studio](https://www.screen.studio) | macOS | Polished promo clips (auto-zoom, cursor smoothing) | Paid |
| [OBS Studio](https://obsproject.com) | macOS / Windows / Linux | Cross-platform recording, scenes, high control | Free, open source |

Pick **Kap** if you want fast and free. Pick **Screen Studio** if you want the README to look like a SaaS launch. Pick **OBS** if you're on Windows or Linux.

## Pre-flight checklist

- [ ] Browser window resized to **1280 × 800** (or 1440 × 900 if zoomed-in clips look better).
- [ ] System bar / clock cleaned: no notifications, no Slack badges, sensitive tabs closed.
- [ ] Browser zoom at 100% in Chrome (`⌘0`).
- [ ] Cursor at default speed; bigger cursor if Screen Studio isn't smoothing.
- [ ] Local dev server running: `pnpm dev`. Open <http://localhost:3000>.
- [ ] Dark mode and light mode both tested — pick the one that looks better that day and stick with it across all clips.
- [ ] Browser theme matched to the OS theme to avoid mismatched chrome.

## Shot list

### 1. Hero GIF — 20 seconds — `docs/assets/hero.gif`

A whirlwind tour: each module gets ~6 seconds.

1. (0–6 s) Land on `/`. Hover module cards. Click the **Quantization** card.
2. (6–12 s) On `/quantization`: cycle the segmented control FP16 → Q8 → Q4 → Q2; pause briefly so the chart marker animation reads.
3. (12–18 s) Navigate to `/tokenizer`. Type a short sentence; let token chips render.
4. (18–20 s) Navigate to `/cost-calculator`. Click the "RAG" template. Linger on the matrix.

Export 1080p, GIF target **< 10 MB** (Kap: "Optimize for size").

### 2. Module A walkthrough — 45 seconds — `docs/assets/module-quantization.gif`

1. Open `/quantization`. Read the title for one beat.
2. Slowly cycle FP16 → Q8 → Q4 → Q3 → Q2. Pause ~3 s on each so viewers can absorb the metric deltas.
3. Hover the Pareto chart. Hover the verdict panel. Scroll down to the sample outputs.
4. End on Q4_K_M — the "sweet spot" recommendation.

### 3. Module B walkthrough — 30 seconds — `docs/assets/module-tokenizer.gif`

1. Open `/tokenizer`.
2. Clear the textarea, paste a mixed-language sentence (English + a non-Latin script like Japanese or Hindi). This is where tokenizer differences become obvious.
3. Cycle through the tokenizer chips: o200k → cl100k → Llama 3 → Mistral → Gemma. Pause on each.
4. Scroll to the leaderboard. Hover the top entry.
5. Scroll to the cost projection. Show that the leader saves money everywhere.

### 4. Module C walkthrough — 45 seconds — `docs/assets/module-cost.gif`

1. Open `/cost-calculator`.
2. Click each template in turn (Chatbot → Summarizer → RAG → Classifier). Pause ~2 s on each to show the matrix re-rank.
3. Tweak "Requests / day" up to 50,000 — show cheap models stay cheap, expensive ones balloon.
4. Click **Save** → name it "Demo". Show the sidebar entry appearing.
5. Click **Export CSV**. The download bar at the bottom is fine to leave in; it's diegetic.

## Export settings

| Asset | Format | Resolution | Frame rate | Target size |
|---|---|---|---|---|
| Hero | GIF | 1080p | 18 fps | ≤ 10 MB |
| Module walkthroughs | GIF or MP4 | 1080p | 24 fps | ≤ 15 MB GIF / ≤ 8 MB MP4 |
| Module screenshots | PNG | 1280 × 800 native | n/a | ≤ 500 KB each |

### Hitting the GIF size budget

If Kap exports >10 MB:

1. Drop frame rate to 15 fps.
2. Reduce resolution to 1280 wide (still sharp).
3. Trim dead frames at start/end.
4. If still too large, export MP4 and accept GitHub will autoplay it from the README.

## File drop locations

Save assets here so the README picks them up:

```
docs/assets/
├── hero.gif
├── module-quantization.png
├── module-quantization.gif      (optional, longer walkthrough)
├── module-tokenizer.png
├── module-tokenizer.gif
├── module-cost.png
└── module-cost.gif
```

The README references `hero.gif`, `module-quantization.png`, `module-tokenizer.png`, and `module-cost.png`. Replace these placeholders before publishing.

## Voice-over (optional)

If you record a narrated walkthrough for LinkedIn / Twitter:

1. Record video + system audio in Screen Studio or OBS.
2. Re-record voice-over separately into a quiet mic. AirPods will do.
3. Mix in Premiere / DaVinci Resolve / iMovie. Aim for –12 dBFS narration peak.

Keep narration to one beat per shot. The clips should still work muted.
