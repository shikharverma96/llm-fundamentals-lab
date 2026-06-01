export interface ParetoPoint<T> {
  /** X coordinate. By convention this is the cost-style axis the user wants minimized. */
  x: number;
  /** Y coordinate. By convention this is the benefit-style axis the user wants maximized. */
  y: number;
  data: T;
}

export interface ParetoOptions {
  /** If true, smaller x is better (default). */
  minimizeX?: boolean;
  /** If true, smaller y is better. Default false — bigger y is better. */
  minimizeY?: boolean;
}

/**
 * Returns the non-dominated subset of points.
 *
 * Point A dominates point B when A is at least as good on both axes
 * AND strictly better on at least one axis. The Pareto frontier is the
 * set of points not dominated by any other point.
 */
export function paretoFrontier<T>(
  points: ReadonlyArray<ParetoPoint<T>>,
  options: ParetoOptions = {},
): ParetoPoint<T>[] {
  const minX = options.minimizeX ?? true;
  const minY = options.minimizeY ?? false;

  const atLeastAsGood = (a: number, b: number, minimize: boolean): boolean =>
    minimize ? a <= b : a >= b;
  const strictlyBetter = (a: number, b: number, minimize: boolean): boolean =>
    minimize ? a < b : a > b;

  return points.filter((candidate) =>
    points.every((other) => {
      if (other === candidate) return true;
      const dominates =
        atLeastAsGood(other.x, candidate.x, minX) &&
        atLeastAsGood(other.y, candidate.y, minY) &&
        (strictlyBetter(other.x, candidate.x, minX) || strictlyBetter(other.y, candidate.y, minY));
      return !dominates;
    }),
  );
}

/**
 * Returns the frontier points sorted by x ascending for chart line rendering.
 */
export function paretoFrontierSorted<T>(
  points: ReadonlyArray<ParetoPoint<T>>,
  options: ParetoOptions = {},
): ParetoPoint<T>[] {
  return paretoFrontier(points, options).slice().sort((a, b) => a.x - b.x);
}
