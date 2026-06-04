/**
 * Minimal SSE parser for the fetch-then-read-body-as-stream pattern.
 * Native EventSource doesn't allow custom headers, which we need (BYOK key).
 */

export interface SseEvent {
  event: string;
  data: string;
}

export function parseChunk(buffer: string): {
  events: SseEvent[];
  remainder: string;
} {
  const events: SseEvent[] = [];
  // Events are separated by a blank line.
  let pos = 0;
  while (true) {
    const sep = buffer.indexOf('\n\n', pos);
    if (sep === -1) break;
    const chunk = buffer.slice(pos, sep);
    pos = sep + 2;

    let eventName = 'message';
    const dataLines: string[] = [];
    for (const rawLine of chunk.split('\n')) {
      const line = rawLine.trimEnd();
      if (!line || line.startsWith(':')) continue;
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const field = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      if (field === 'event') eventName = value;
      else if (field === 'data') dataLines.push(value);
    }
    events.push({ event: eventName, data: dataLines.join('\n') });
  }
  return { events, remainder: buffer.slice(pos) };
}
