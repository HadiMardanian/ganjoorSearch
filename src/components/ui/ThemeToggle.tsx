import { Moon, Sun } from 'lucide-react';
import type { Theme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';

interface ThemeToggleProps {
  theme: Theme;
  onChange: (theme: Theme) => void;
}

const LABELS: Record<Theme, string> = {
  light: 'روشن',
  dark: 'تاریک',
  system: 'سیستم',
};

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  function cycleTheme() {
    const order: Theme[] = ['light', 'dark', 'system'];
    const index = order.indexOf(theme);
    onChange(order[(index + 1) % order.length]!);
  }

  return (
    <Button
      variant="ghost"
      className="fixed left-4 top-4 z-40"
      onClick={cycleTheme}
      aria-label={`حالت نمایش: ${LABELS[theme]}`}
    >
      {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
      {LABELS[theme]}
    </Button>
  );
}
