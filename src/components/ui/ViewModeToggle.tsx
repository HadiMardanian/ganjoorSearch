import type { ViewMode } from '@/types/ganjoor';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div
      className="surface-card inline-flex rounded-xl border p-1 shadow-sm"
      role="group"
      aria-label="حالت نمایش نتایج"
    >
      {(
        [
          ['verse', 'نمایش گنجور'],
          ['full', 'نمایش متن کامل'],
        ] as const
      ).map(([mode, label]) => (
        <button
          key={mode}
          type="button"
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            value === mode
              ? 'bg-[var(--color-accent)] text-white shadow-sm'
              : 'text-muted hover:bg-[var(--color-surface)]'
          }`}
          onClick={() => onChange(mode)}
          aria-pressed={value === mode}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
