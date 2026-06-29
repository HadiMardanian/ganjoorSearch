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
    <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1 text-sm font-medium text-stone-800">
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
            className="rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800 hover:border-[#9a3412] hover:text-[#9a3412]"
            onClick={() => onSelect(entry)}
          >
            {entry.term}
          </button>
        ))}
      </div>
    </div>
  );
}
