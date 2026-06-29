import { Moon, Sun } from 'lucide-react';
import type { Theme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';

interface ThemeToggleProps {
  theme: Theme;
  onChange: (theme: Theme) => void;
  className?: string;
}

const LABELS: Record<Theme, string> = {
  light: 'روشن',
  dark: 'تاریک',
  system: 'سیستم',
};

export function ThemeToggle({ theme, onChange, className = '' }: ThemeToggleProps) {
  function cycleTheme() {
    const order: Theme[] = ['light', 'dark', 'system'];
    const index = order.indexOf(theme);
    onChange(order[(index + 1) % order.length]!);
  }

  return (
    <Button
      variant="ghost"
      className={`shrink-0 px-2.5 py-2 text-sm sm:px-4 ${className}`}
      onClick={cycleTheme}
      aria-label={`حالت نمایش: ${LABELS[theme]}`}
    >
      {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
      <span className="hidden min-[400px]:inline">{LABELS[theme]}</span>
    </Button>
  );
}
