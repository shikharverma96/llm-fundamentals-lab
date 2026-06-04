'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

export default function RagError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);
  return (
    <div role="alert" className="space-y-3 rounded-xl border border-destructive/40 p-6">
      <h2 className="text-lg font-semibold">Couldn’t render the RAG module</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button onClick={reset} size="sm">
        Retry
      </Button>
    </div>
  );
}
