import type { Theme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface HeaderProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function Header({ theme, onThemeChange }: HeaderProps) {
  return (
    <header className="relative border-b border-stone-300 bg-white">
      <div className="absolute start-3 top-3 z-10 sm:start-4 sm:top-4">
        <ThemeToggle theme={theme} onChange={onThemeChange} />
      </div>
      <div className="mx-auto max-w-5xl px-4 pb-8 pt-14 text-center sm:px-6 sm:pb-10 sm:pt-12">
        <p className="mb-2 text-sm font-semibold tracking-wide text-[#9a3412]">✦ گنجور سرچ</p>
        <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">
          جستجوی اشعار فارسی
        </h1>
        <p className="mt-3 text-base text-stone-700 sm:text-lg">
          جستجو در هزاران بیت شعر پارسی — سریع، دقیق و زیبا
        </p>
      </div>
    </header>
  );
}
