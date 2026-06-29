import { Download } from 'lucide-react';
import type { Theme } from '@/hooks/useTheme';
import { PoetAvatar } from '@/components/install/PoetAvatar';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import type { Poet } from '@/types/ganjoor';

interface HeaderProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  poetApp?: Poet | null;
  showInstallCta?: boolean;
  onInstallClick?: () => void;
}

export function Header({
  theme,
  onThemeChange,
  poetApp,
  showInstallCta,
  onInstallClick,
}: HeaderProps) {
  const poetName = poetApp?.name || poetApp?.fullName;

  return (
    <header className="surface-card relative border-b">
      <div className="absolute start-3 top-3 z-10 sm:start-4 sm:top-4">
        <ThemeToggle theme={theme} onChange={onThemeChange} />
      </div>

      {showInstallCta && onInstallClick ? (
        <div className="absolute end-3 top-3 z-10 sm:end-4 sm:top-4">
          <Button
            type="button"
            variant="secondary"
            className="hidden px-3 py-2 text-xs sm:inline-flex sm:text-sm"
            onClick={onInstallClick}
          >
            <Download size={16} />
            نصب اپ شاعر
          </Button>
          <button
            type="button"
            className="surface-card text-accent hover:bg-[var(--color-accent-soft)] inline-flex h-10 w-10 items-center justify-center rounded-xl border sm:hidden"
            onClick={onInstallClick}
            aria-label="نصب اپ شاعر دلخواه"
          >
            <Download size={18} />
          </button>
        </div>
      ) : null}

      <div className="mx-auto max-w-5xl px-4 pb-8 pt-14 text-center sm:px-6 sm:pb-10 sm:pt-12">
        {poetApp && poetName ? (
          <>
            <div className="mb-4 flex justify-center">
              <PoetAvatar poet={poetApp} size="md" />
            </div>
            <p className="mb-2 text-sm font-semibold tracking-wide text-accent">✦ {poetName}</p>
            <h1 className="text-3xl font-bold sm:text-4xl">جستجوی اشعار {poetName}</h1>
            <p className="text-muted mt-3 text-base sm:text-lg">
              اپ اختصاصی {poetName} — سریع، دقیق و زیبا
            </p>
          </>
        ) : (
          <>
            <p className="mb-2 text-sm font-semibold tracking-wide text-accent">✦ گنجور سرچ</p>
            <h1 className="text-3xl font-bold sm:text-4xl">جستجوی اشعار فارسی</h1>
            <p className="text-muted mt-3 text-base sm:text-lg">
              جستجو در هزاران بیت شعر پارسی — سریع، دقیق و زیبا
            </p>
            {showInstallCta && onInstallClick ? (
              <div className="mt-5 sm:hidden">
                <Button type="button" variant="secondary" onClick={onInstallClick}>
                  <Download size={16} />
                  نصب اپ شاعر دلخواه
                </Button>
                <p className="text-muted mt-2 text-xs">
                  حافظ، سعدی، مولوی… روی صفحهٔ اصلی گوشی
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </header>
  );
}
