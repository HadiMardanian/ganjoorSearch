import { GANJOOR_SITE } from '@/api/client';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-white/60 py-8 text-center text-sm text-stone-600">
      <p>
        داده‌ها از{' '}
        <a
          href={GANJOOR_SITE}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-accent hover:underline"
        >
          گنجور
        </a>{' '}
        دریافت می‌شوند.
      </p>
      <p className="mt-2 text-stone-500">
        پروژهٔ متن‌باز — جستجوی اشعار فارسی
      </p>
    </footer>
  );
}
