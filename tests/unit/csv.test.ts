import { describe, expect, it } from 'vitest';

import { csvEscape, toCSV } from '@/lib/csv';

describe('csvEscape', () => {
  it('passes plain values through', () => {
    expect(csvEscape('hello')).toBe('hello');
    expect(csvEscape(42)).toBe('42');
  });

  it('quotes values containing commas', () => {
    expect(csvEscape('a,b')).toBe('"a,b"');
  });

  it('escapes embedded quotes by doubling', () => {
    expect(csvEscape('she said "hi"')).toBe('"she said ""hi"""');
  });

  it('quotes values with newlines', () => {
    expect(csvEscape('line1\nline2')).toBe('"line1\nline2"');
  });

  it('renders null/undefined as empty', () => {
    expect(csvEscape(null)).toBe('');
    expect(csvEscape(undefined)).toBe('');
  });
});

describe('toCSV', () => {
  it('joins rows with newlines and cells with commas', () => {
    const csv = toCSV([
      ['name', 'val'],
      ['a', 1],
      ['b,c', 2],
    ]);
    expect(csv).toBe('name,val\na,1\n"b,c",2');
  });
});
