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
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedPoet = poets.find((poet) => poet.id === value);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return poets;
    return poets.filter((poet) =>
      (poet.name || poet.fullName || '').toLowerCase().includes(normalized),
    );
  }, [poets, query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full sm:w-56">
      <label className="field-label">شاعر</label>
      <div className="field-control flex items-center px-1 focus-within:border-[#9a3412] focus-within:shadow-[0_0_0_3px_rgb(154_52_18_/_15%)]">
        <input
          type="text"
          className="w-full rounded-xl bg-transparent px-3 py-3 text-sm text-stone-900 outline-none placeholder:text-stone-500"
          placeholder="همه شاعران"
          value={open ? query : selectedPoet?.name ?? ''}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          disabled={disabled}
          aria-label="جستجوی نام شاعر"
          dir="rtl"
        />
        {(value !== 'all' || query) && !disabled && (
          <button
            type="button"
            className="px-3 text-stone-500 hover:text-stone-800"
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
        <div className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-stone-300 bg-white p-2 shadow-lg">
          <button
            type="button"
            className={`w-full rounded-lg px-3 py-2 text-right text-sm text-stone-900 hover:bg-stone-100 ${
              value === 'all' ? 'bg-orange-50 font-semibold text-[#9a3412]' : ''
            }`}
            onClick={() => {
              onChange('all');
              setQuery('');
              setOpen(false);
            }}
          >
            همه شاعران
          </button>
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-stone-600">شاعری یافت نشد</p>
          ) : (
            filtered.map((poet) => (
              <button
                key={poet.id}
                type="button"
                className={`w-full rounded-lg px-3 py-2 text-right text-sm text-stone-900 hover:bg-stone-100 ${
                  value === poet.id ? 'bg-orange-50 font-semibold text-[#9a3412]' : ''
                }`}
                onClick={() => {
                  onChange(poet.id);
                  setQuery('');
                  setOpen(false);
                }}
              >
                {poet.name || poet.fullName}
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
}

export function CategorySelect({
  categories,
  value,
  onChange,
  poetSelected,
}: CategorySelectProps) {
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
        disabled={!poetSelected}
        aria-label="انتخاب قالب شعر"
      >
        <option value="all">همه قالب‌ها</option>
        {categories.map((category) => (
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
  poetPicker: ReactNode;
  categorySelect: ReactNode;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  loading,
  poetPicker,
  categorySelect,
}: SearchBarProps) {
  return (
    <form
      className="rounded-2xl border border-stone-300 bg-white p-4 shadow-md sm:p-5"
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
        </div>
      </div>
    </form>
  );
}
