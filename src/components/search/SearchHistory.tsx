import { Clock, Trash2 } from 'lucide-react';
import type { SearchHistoryEntry } from '@/hooks/useSearchHistory';
import { Button } from '@/components/ui/Button';

interface SearchHistoryProps {
  entries: SearchHistoryEntry[];
  onSelect: (entry: SearchHistoryEntry) => void;
  onClear: () => void;
}

export function SearchHistory({ entries, onSelect, onClear }: SearchHistoryProps) {
  if (entries.length === 0) return null;

  return (
    <div className="surface-muted mt-3 rounded-xl border p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1 text-sm font-medium">
          <Clock size={14} />
          جستجوهای اخیر
        </p>
        <Button variant="ghost" className="px-2 py-1 text-xs" onClick={onClear}>
          <Trash2 size={14} />
          پاک کردن
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {entries.map((entry) => (
          <button
            key={`${entry.term}-${entry.poetId}-${entry.categoryId}-${entry.timestamp}`}
            type="button"
            className="surface-card rounded-full border px-3 py-1 text-sm hover:border-[var(--color-accent)] hover:text-accent"
            onClick={() => onSelect(entry)}
          >
            {entry.term}
          </button>
        ))}
      </div>
    </div>
  );
}
