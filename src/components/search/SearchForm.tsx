import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Poet } from '@/types/ganjoor';
import { Button } from '@/components/ui/Button';

interface PoetPickerProps {
  poets: Poet[];
  value: number | 'all';
  onChange: (value: number | 'all') => void;
  disabled?: boolean;
}

export function PoetPicker({ poets, value, onChange, disabled }: PoetPickerProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = 'poet-picker-listbox';

  const selectedPoet = poets.find((poet) => poet.id === value);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return poets;
    return poets.filter((poet) =>
      (poet.name || poet.fullName || '').toLowerCase().includes(normalized),
    );
  }, [poets, query]);

  const options = useMemo(
    () => [{ id: 'all' as const, name: 'همه شاعران' }, ...filtered.map((p) => ({ id: p.id, name: p.name || p.fullName || '' }))],
    [filtered],
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectOption(optionId: number | 'all') {
    onChange(optionId);
    setQuery('');
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      setOpen(true);
      return;
    }

    if (!open) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, options.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) selectOption(option.id);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full sm:w-56">
      <label htmlFor="poet-picker-input" className="field-label">
        شاعر
      </label>
      <div
        className="field-control flex items-center px-1 focus-within:border-[var(--color-accent)] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent)_15%,transparent)]"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
      >
        <input
          id="poet-picker-input"
          type="text"
          className="w-full rounded-xl bg-transparent px-3 py-3 text-sm outline-none placeholder:text-subtle"
          placeholder="همه شاعران"
          value={open ? query : selectedPoet?.name ?? ''}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-autocomplete="list"
          aria-label="جستجوی نام شاعر"
          aria-activedescendant={
            activeIndex >= 0 ? `poet-option-${activeIndex}` : undefined
          }
          dir="rtl"
        />
        {(value !== 'all' || query) && !disabled && (
          <button
            type="button"
            className="text-subtle hover:text-[var(--color-ink)]"
            onClick={() => {
              onChange('all');
              setQuery('');
              setOpen(false);
            }}
            aria-label="پاک کردن جستجوی شاعر"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {open && !disabled && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border surface-card p-2 shadow-lg"
        >
          {options.length === 0 ? (
            <p className="text-muted px-3 py-4 text-center text-sm">شاعری یافت نشد</p>
          ) : (
            options.map((option, index) => (
              <button
                key={String(option.id)}
                id={`poet-option-${index}`}
                type="button"
                role="option"
                aria-selected={value === option.id}
                className={`w-full rounded-lg px-3 py-2 text-start text-sm hover:bg-[var(--color-surface)] ${
                  value === option.id ? 'bg-[var(--color-accent-soft)] font-semibold text-accent' : ''
                } ${activeIndex === index ? 'ring-1 ring-[var(--color-accent)]' : ''}`}
                onClick={() => selectOption(option.id)}
              >
                {option.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface CategorySelectProps {
  categories: Array<{ id: number; title: string }>;
  value: number | 'all';
  onChange: (value: number | 'all') => void;
  poetSelected: boolean;
  loading?: boolean;
}

export function CategorySelect({
  categories,
  value,
  onChange,
  poetSelected,
  loading = false,
}: CategorySelectProps) {
  const disabled = !poetSelected || loading;

  return (
    <div className="w-full sm:w-44">
      <label htmlFor="category-select" className="field-label">
        قالب
      </label>
      <select
        id="category-select"
        className="field-control px-3 py-3 text-sm"
        value={value === 'all' ? 'all' : String(value)}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next === 'all' ? 'all' : Number(next));
        }}
        disabled={disabled}
        aria-label="انتخاب قالب شعر"
        aria-busy={loading}
      >
        <option value="all">{loading ? 'در حال بارگذاری…' : 'همه قالب‌ها'}</option>
        {!loading &&
          categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))}
      </select>
    </div>
  );
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  loading?: boolean;
  filtersDirty?: boolean;
  poetPicker?: ReactNode;
  categorySelect: ReactNode;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  loading,
  filtersDirty,
  poetPicker,
  categorySelect,
}: SearchBarProps) {
  return (
    <form
      className="surface-card rounded-2xl border p-4 shadow-md sm:p-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        {poetPicker}
        {categorySelect}
        <div className="flex-1">
          <label htmlFor="search-input" className="field-label">
            کلمهٔ جستجو
          </label>
          <div className="flex gap-2">
            <input
              id="search-input"
              type="search"
              className="field-control px-4 py-3 text-base"
              placeholder="جستجوی کلمه در اشعار..."
              value={value}
              onChange={(event) => onChange(event.target.value)}
              disabled={loading}
              aria-label="جستجوی کلمه"
              dir="rtl"
            />
            <Button type="submit" disabled={loading || !value.trim()} className="shrink-0 px-5">
              <Search size={18} />
              {loading ? 'در حال جستجو...' : 'جستجو'}
            </Button>
          </div>
          {filtersDirty ? (
            <p className="mt-2 text-xs text-amber-800">
              فیلترها تغییر کرده‌اند — برای اعمال، «جستجو» را بزنید.
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
