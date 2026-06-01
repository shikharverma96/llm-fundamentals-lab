'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface SegmentedProps<T extends string> {
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onChange: (next: T) => void;
  className?: string;
  ariaLabel: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  ariaLabel,
}: SegmentedProps<T>): React.ReactElement {
  const idx = options.findIndex((o) => o.value === value);

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') {
      return;
    }
    e.preventDefault();
    let nextIdx = idx;
    if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + options.length) % options.length;
    if (e.key === 'ArrowRight') nextIdx = (idx + 1) % options.length;
    if (e.key === 'Home') nextIdx = 0;
    if (e.key === 'End') nextIdx = options.length - 1;
    const next = options[nextIdx];
    if (next) onChange(next.value);
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={handleKey}
      className={cn(
        'inline-flex flex-wrap gap-1 rounded-lg border bg-muted p-1 text-sm',
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.value)}
            title={opt.description}
            className={cn(
              'rounded-md px-3 py-1.5 font-medium transition-all',
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
