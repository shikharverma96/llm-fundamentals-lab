'use client';

import { z } from 'zod';

import { TemplateIdEnum } from '@/lib/schemas/templates';
import { loadFromStorage, saveToStorage } from '@/lib/storage';

export const STORAGE_KEY = 'llm-lab/saved-comparisons/v1';

export const SavedComparisonSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  savedAt: z.string(),
  templateId: TemplateIdEnum,
  inputTokensPerRequest: z.number().nonnegative(),
  outputTokensPerRequest: z.number().nonnegative(),
  requestsPerDay: z.number().nonnegative(),
});
export type SavedComparison = z.infer<typeof SavedComparisonSchema>;

export const SavedComparisonsSchema = z.array(SavedComparisonSchema);
export type SavedComparisons = z.infer<typeof SavedComparisonsSchema>;

export function loadSaved(): SavedComparisons {
  return loadFromStorage(STORAGE_KEY, SavedComparisonsSchema) ?? [];
}

export function persistSaved(value: SavedComparisons): void {
  saveToStorage(STORAGE_KEY, value);
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
