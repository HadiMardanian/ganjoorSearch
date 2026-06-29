import { BookOpen, Search } from 'lucide-react';
import type { PoetAppTab } from '@/hooks/useSearchParams';

interface PoetAppBottomNavProps {
  activeTab: PoetAppTab;
  onChange: (tab: PoetAppTab) => void;
}

export function PoetAppBottomNav({ activeTab, onChange }: PoetAppBottomNavProps) {
  return (
    <nav
      className="poet-app-bottom-nav surface-card fixed inset-x-0 bottom-0 z-30 border-t pb-safe"
      aria-label="ناوبری اپ شاعر"
    >
      <div className="mx-auto grid max-w-5xl grid-cols-2">
        <button
          type="button"
          className={`flex min-h-[56px] flex-col items-center justify-center gap-1 px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === 'browse' ? 'text-accent' : 'text-muted'
          }`}
          onClick={() => onChange('browse')}
        >
          <BookOpen size={22} strokeWidth={activeTab === 'browse' ? 2.5 : 2} />
          مرور آثار
        </button>
        <button
          type="button"
          className={`flex min-h-[56px] flex-col items-center justify-center gap-1 px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === 'search' ? 'text-accent' : 'text-muted'
          }`}
          onClick={() => onChange('search')}
        >
          <Search size={22} strokeWidth={activeTab === 'search' ? 2.5 : 2} />
          جستجو
        </button>
      </div>
    </nav>
  );
}
