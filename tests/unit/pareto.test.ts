import { describe, expect, it } from 'vitest';

import { paretoFrontier, paretoFrontierSorted } from '@/lib/pareto';

describe('paretoFrontier', () => {
  it('keeps a single point as its own frontier', () => {
    const f = paretoFrontier([{ x: 5, y: 5, data: 'a' }]);
    expect(f).toHaveLength(1);
  });

  it('drops dominated points (min x, max y)', () => {
    // Two points: cheap+high-quality dominates expensive+low-quality
    const f = paretoFrontier([
      { x: 10, y: 90, data: 'good' },
      { x: 20, y: 80, data: 'bad' },
    ]);
    expect(f.map((p) => p.data)).toEqual(['good']);
  });

  it('keeps non-dominated tradeoffs', () => {
    const f = paretoFrontier([
      { x: 10, y: 70, data: 'cheap-but-meh' },
      { x: 30, y: 95, data: 'expensive-but-great' },
      { x: 20, y: 80, data: 'middle' },
    ]);
    expect(f.map((p) => p.data).sort()).toEqual(
      ['cheap-but-meh', 'expensive-but-great', 'middle'].sort(),
    );
  });

  it('removes a strictly dominated middle point', () => {
    const f = paretoFrontier([
      { x: 10, y: 70, data: 'cheap' },
      { x: 20, y: 65, data: 'dominated' }, // worse on both axes than cheap
      { x: 30, y: 95, data: 'expensive' },
    ]);
    expect(f.map((p) => p.data).sort()).toEqual(['cheap', 'expensive']);
  });

  it('supports maximize-X mode', () => {
    // Now bigger x is better and bigger y is better — top-right wins
    const f = paretoFrontier(
      [
        { x: 1, y: 1, data: 'sw' },
        { x: 10, y: 10, data: 'ne' },
        { x: 5, y: 5, data: 'mid' },
      ],
      { minimizeX: false, minimizeY: false },
    );
    expect(f.map((p) => p.data)).toEqual(['ne']);
  });

  it('sorts frontier by x ascending for line rendering', () => {
    const f = paretoFrontierSorted([
      { x: 30, y: 95, data: 'c' },
      { x: 10, y: 70, data: 'a' },
      { x: 20, y: 80, data: 'b' },
    ]);
    expect(f.map((p) => p.x)).toEqual([10, 20, 30]);
  });
});
