import type { Metadata } from 'next';

import { quantizationBenchmarks } from '@/lib/data';

import { QuantizationView } from './_components/quantization-view';

export const metadata: Metadata = {
  title: 'Quantization Benchmark Visualizer',
  description:
    'Explore how FP16, INT8, INT4, INT3, and INT2 quantization shift size, RAM, throughput, and quality for Qwen2.5-0.5B-Instruct.',
};

export default function QuantizationPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Module A
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Quantization Benchmark Visualizer</h1>
        <p className="max-w-3xl text-muted-foreground">
          Pre-computed benchmarks for{' '}
          <span className="font-mono text-xs">{quantizationBenchmarks.model}</span> across five
          quantization levels. Drag through them to feel where the quality cliff appears.
        </p>
      </header>
      <QuantizationView data={quantizationBenchmarks} />
    </div>
  );
}
