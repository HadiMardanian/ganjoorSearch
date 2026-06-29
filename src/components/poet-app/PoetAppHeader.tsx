import { MoreVertical } from 'lucide-react';
import type { Theme } from '@/hooks/useTheme';
import { PoetAvatar } from '@/components/install/PoetAvatar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import type { Poet } from '@/types/ganjoor';
import { useState } from 'react';

export type PoetAppScreen = 'home' | 'category' | 'reader' | 'search';

interface PoetAppHeaderProps {
  poet: Poet;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  screen: PoetAppScreen;
  title?: string;
  onChangePoet: () => void;
}

export function PoetAppHeader({
  poet,
  theme,
  onThemeChange,
  screen,
  title,
  onChangePoet,
}: PoetAppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const poetName = poet.name || poet.fullName || 'شاعر';

  const heading =
    screen === 'reader'
      ? title || 'مطالعه'
      : screen === 'category'
        ? title || 'بخش'
        : screen === 'search'
          ? `جستجو در ${poetName}`
          : `آثار ${poetName}`;

  return (
    <header className="poet-app-header surface-card sticky top-0 z-30 border-b pt-safe">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
        <PoetAvatar poet={poet} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-subtle truncate text-xs">{poetName}</p>
          <h1 className="truncate text-sm font-bold sm:text-base">{heading}</h1>
        </div>

        <div className="relative flex items-center gap-1">
          <ThemeToggle theme={theme} onChange={onThemeChange} />
          <button
            type="button"
            className="text-muted hover:text-[var(--color-ink)] flex h-10 w-10 items-center justify-center rounded-xl"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="منو"
            aria-expanded={menuOpen}
          >
            <MoreVertical size={20} />
          </button>

          {menuOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40"
                aria-label="بستن منو"
                onClick={() => setMenuOpen(false)}
              />
              <div className="surface-card absolute end-0 top-11 z-50 min-w-[200px] rounded-xl border p-2 shadow-lg">
                <button
                  type="button"
                  className="hover:bg-[var(--color-surface)] w-full rounded-lg px-3 py-2.5 text-start text-sm"
                  onClick={() => {
                    setMenuOpen(false);
                    onChangePoet();
                  }}
                >
                  تغییر شاعر / نصب شاعر دیگر
                </button>
                <p className="text-subtle border-t px-3 py-2 text-xs leading-5">
                  داده‌ها از{' '}
                  <a
                    href="https://ganjoor.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    گنجور
                  </a>
                </p>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
