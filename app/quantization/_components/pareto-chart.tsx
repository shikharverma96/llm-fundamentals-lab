'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';

import { paretoFrontierSorted } from '@/lib/pareto';
import {
  QUANTIZATION_LABELS,
  type QuantizationLevel,
  type QuantizationVariant,
} from '@/lib/schemas/benchmarks';

interface Props {
  variants: readonly QuantizationVariant[];
  selectedLevel: QuantizationLevel;
}

interface ChartPoint {
  x: number; // size (MB) — minimize
  y: number; // quality (MMLU * 100) — maximize
  label: string;
  level: QuantizationLevel;
  isSelected: boolean;
}

export function ParetoChart({ variants, selectedLevel }: Props): React.ReactElement {
  const points: ChartPoint[] = variants.map((v) => ({
    x: v.fileSizeMB,
    y: v.mmluMini * 100,
    label: QUANTIZATION_LABELS[v.level],
    level: v.level,
    isSelected: v.level === selectedLevel,
  }));

  const frontier = paretoFrontierSorted(
    points.map((p) => ({ x: p.x, y: p.y, data: p })),
    { minimizeX: true, minimizeY: false },
  ).map((p) => ({ x: p.x, y: p.y }));

  const selectedPoint = points.find((p) => p.isSelected);

  return (
    <div className="h-[340px] w-full" role="img" aria-label="Pareto chart: size vs quality">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 16, right: 16, bottom: 32, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
          <XAxis
            type="number"
            dataKey="x"
            name="File size (MB)"
            unit=" MB"
            domain={['dataMin - 50', 'dataMax + 50']}
            tickCount={6}
            label={{ value: 'File size (MB) — lower is better', position: 'insideBottom', offset: -16 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="MMLU-mini"
            unit="%"
            domain={['dataMin - 2', 'dataMax + 2']}
            label={{ value: 'MMLU-mini (higher better)', angle: -90, position: 'insideLeft' }}
          />
          <ZAxis type="number" range={[80, 80]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(value: number | string, key: string) => {
              if (key === 'x') return [`${value} MB`, 'Size'];
              if (key === 'y') return [`${Number(value).toFixed(1)}%`, 'MMLU'];
              return [value, key];
            }}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as ChartPoint | undefined;
              return p?.label ?? '';
            }}
          />
          <Legend verticalAlign="top" height={28} />
          <Line
            type="monotone"
            data={frontier}
            dataKey="y"
            name="Pareto frontier"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            legendType="line"
            isAnimationActive={false}
          />
          <Scatter
            name="Variants"
            data={points.filter((p) => !p.isSelected)}
            fill="hsl(var(--muted-foreground))"
          />
          {selectedPoint && (
            <Scatter
              name="Selected"
              data={[selectedPoint]}
              fill="hsl(var(--primary))"
              shape="star"
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
