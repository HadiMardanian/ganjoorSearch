import { BookOpen, Search } from 'lucide-react';
import type { PoetAppTab } from '@/hooks/useSearchParams';
import { Button } from '@/components/ui/Button';

interface PoetAppTabsProps {
  activeTab: PoetAppTab;
  onChange: (tab: PoetAppTab) => void;
}

export function PoetAppTabs({ activeTab, onChange }: PoetAppTabsProps) {
  return (
    <div className="mb-6 flex justify-center">
      <div className="surface-card inline-flex rounded-2xl border p-1 shadow-sm">
        <Button
          type="button"
          variant={activeTab === 'browse' ? 'primary' : 'ghost'}
          className="rounded-xl px-5"
          onClick={() => onChange('browse')}
        >
          <BookOpen size={18} />
          مرور آثار
        </Button>
        <Button
          type="button"
          variant={activeTab === 'search' ? 'primary' : 'ghost'}
          className="rounded-xl px-5"
          onClick={() => onChange('search')}
        >
          <Search size={18} />
          جستجو
        </Button>
      </div>
    </div>
  );
}
