import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RagDoDontItem } from '@/lib/schemas/rag';
import { cn } from '@/lib/utils';

interface Props {
  dos: RagDoDontItem[];
  donts: RagDoDontItem[];
}

function List({
  items,
  variant,
}: {
  items: RagDoDontItem[];
  variant: 'do' | 'dont';
}): React.ReactElement {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.title}
          className={cn(
            'rounded-lg border p-3',
            variant === 'do'
              ? 'border-emerald-300/60 bg-emerald-50/40 dark:border-emerald-800/60 dark:bg-emerald-950/30'
              : 'border-amber-300/60 bg-amber-50/40 dark:border-amber-800/60 dark:bg-amber-950/30',
          )}
        >
          <div className="flex items-start gap-2">
            <span
              aria-hidden
              className={cn(
                'mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                variant === 'do' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white',
              )}
            >
              {variant === 'do' ? '✓' : '×'}
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold leading-snug">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.reason}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DoDont({ dos, donts }: Props): React.ReactElement {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Do</CardTitle>
        </CardHeader>
        <CardContent>
          <List items={dos} variant="do" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Don’t</CardTitle>
        </CardHeader>
        <CardContent>
          <List items={donts} variant="dont" />
        </CardContent>
      </Card>
    </div>
  );
}
