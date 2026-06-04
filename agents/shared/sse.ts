/**
 * SSE encoder — pure helpers. No framework dependency.
 * Use with Next.js Route Handler streaming responses (Web ReadableStream).
 */

const encoder = new TextEncoder();

export function sseEvent(event: string, data: unknown): Uint8Array {
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  return encoder.encode(`event: ${event}\ndata: ${payload}\n\n`);
}

export function sseComment(text: string): Uint8Array {
  return encoder.encode(`: ${text}\n\n`);
}

/** Standard SSE response headers — no caching, no proxy buffering. */
export const SSE_HEADERS = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
  'X-Accel-Buffering': 'no',
} as const;
