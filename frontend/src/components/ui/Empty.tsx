import { cn } from '@/lib/utils';

interface Props { message?: string; className?: string }

export default function Empty({ message = 'No results.', className }: Props) {
  return (
    <div className={cn('flex items-center justify-center py-16 text-zinc-500 text-sm', className)}>
      {message}
    </div>
  );
}
