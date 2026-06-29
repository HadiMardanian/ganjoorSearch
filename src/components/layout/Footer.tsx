import { GANJOOR_SITE } from '@/api/client';

export function Footer() {
  return (
    <footer className="surface-card mt-auto border-t py-8 text-center text-sm text-muted">
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
      <p className="text-subtle mt-2">
        پروژهٔ متن‌باز — جستجوی اشعار فارسی
      </p>
    </footer>
  );
}
