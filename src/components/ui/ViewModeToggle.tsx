import type { ViewMode } from '@/types/ganjoor';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div
      className="inline-flex rounded-xl border border-stone-300 bg-white p-1 shadow-sm"
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
              ? 'bg-[#9a3412] text-white shadow-sm'
              : 'text-stone-800 hover:bg-stone-100'
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
