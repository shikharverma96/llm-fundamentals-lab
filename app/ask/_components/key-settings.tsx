'use client';

import { useEffect, useState } from 'react';

import { getApiKey, maskApiKey, setApiKey } from '@/lib/api-key';

export function KeySettings(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [stored, setStored] = useState('');

  useEffect(() => {
    const k = getApiKey();
    setStored(k);
    setValue(k);
  }, []);

  function save(): void {
    setApiKey(value.trim());
    setStored(value.trim());
    setOpen(false);
  }

  function clear(): void {
    setApiKey('');
    setStored('');
    setValue('');
  }

  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Anthropic API key</p>
          <p className="text-xs text-muted-foreground">
            {stored
              ? `Stored locally: ${maskApiKey(stored)}`
              : 'Not set — paste your key to enable live agents.'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
          >
            {open ? 'Cancel' : stored ? 'Change' : 'Add key'}
          </button>
          {stored ? (
            <button
              type="button"
              onClick={clear}
              className="rounded-md border px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {open ? (
        <div className="mt-3 space-y-2">
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="sk-ant-api03-…"
            className="w-full rounded-md border bg-background px-3 py-2 font-mono text-sm"
            aria-label="Anthropic API key"
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">
            Key lives in your browser&apos;s localStorage. Sent only as the{' '}
            <code>x-anthropic-key</code> header on requests to <code>/api/ask</code>. Never logged
            or persisted on the server.
          </p>
          <button
            type="button"
            onClick={save}
            disabled={!value.trim().startsWith('sk-ant-')}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-40"
          >
            Save
          </button>
        </div>
      ) : null}
    </div>
  );
}
