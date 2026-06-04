'use client';

/**
 * Tiny localStorage wrapper for the BYOK Anthropic key. Never persisted
 * server-side; only ever sent in the x-anthropic-key request header.
 */

const KEY = 'llm-lab.anthropic-key';

export function getApiKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}

export function setApiKey(value: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (value) window.localStorage.setItem(KEY, value);
    else window.localStorage.removeItem(KEY);
  } catch {
    // localStorage disabled — silent
  }
}

export function maskApiKey(value: string): string {
  if (!value) return '';
  if (value.length < 12) return '••••';
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}
