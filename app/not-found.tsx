import Link from 'next/link';

export default function NotFound(): React.ReactElement {
  return (
    <div className="mx-auto max-w-md space-y-4 py-20 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">The page you’re looking for doesn’t exist.</p>
      <Link href="/" className="text-primary underline-offset-4 hover:underline">
        Back to home
      </Link>
    </div>
  );
}
