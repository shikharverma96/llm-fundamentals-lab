/**
 * Generic read-only JSON lookup utility. Every expert composes this
 * around its own dataset to expose a single retrieval tool to the model.
 *
 * No file IO here — caller passes the already-parsed dataset. This file
 * is safe to import from edge/serverless route handlers.
 */

/** Search a list of records by string fields. Case-insensitive substring. */
export function searchRecords<T extends Record<string, unknown>>(
  records: readonly T[],
  query: string,
  fields: readonly (keyof T)[],
  limit = 5,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return records.slice(0, limit);
  const hits: { score: number; rec: T }[] = [];
  for (const rec of records) {
    let score = 0;
    for (const f of fields) {
      const v = rec[f];
      if (typeof v === 'string' && v.toLowerCase().includes(q)) score += 1;
    }
    if (score > 0) hits.push({ score, rec });
  }
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit).map((h) => h.rec);
}

/** Find a record by exact id-like field. */
export function findById<T extends Record<string, unknown>>(
  records: readonly T[],
  idField: keyof T,
  id: string,
): T | undefined {
  return records.find((r) => r[idField] === id);
}
