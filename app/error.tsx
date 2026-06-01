'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

export default function RootError({
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
    <div role="alert" className="mx-auto max-w-lg space-y-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        {error.message || 'An unexpected error occurred while rendering this page.'}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
