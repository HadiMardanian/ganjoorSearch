import { Loader2 } from 'lucide-react';
import { PoetAvatar } from '@/components/install/PoetAvatar';
import type { Poet } from '@/types/ganjoor';

interface InstallPromptWaitingProps {
  poet: Poet;
  phase: 'manifest' | 'prompt';
}

const messages = {
  manifest: {
    title: 'در حال آماده‌سازی اپ…',
    detail: 'آیکون و اطلاعات شاعر بارگذاری می‌شود.',
  },
  prompt: {
    title: 'در حال آماده‌سازی دکمهٔ نصب…',
    detail: 'مرورگر در حال بررسی امکان نصب است — لطفاً چند لحظه صبر کنید.',
  },
} as const;

export function InstallPromptWaiting({ poet, phase }: InstallPromptWaitingProps) {
  const name = poet.name || poet.fullName || 'شاعر';
  const { title, detail } = messages[phase];

  return (
    <div
      className="surface-muted flex flex-col items-center rounded-xl border px-4 py-8 text-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative mb-5">
        <PoetAvatar poet={poet} size="lg" className="opacity-90" />
        <span className="absolute -bottom-1 -left-1 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-card)] shadow-md ring-2 ring-[var(--color-border)]">
          <Loader2 size={20} className="text-accent animate-spin" aria-hidden />
        </span>
      </div>
      <p className="text-base font-medium">{title}</p>
      <p className="text-muted mt-2 max-w-xs text-sm">{detail}</p>
      <div className="mt-5 flex items-center gap-1.5" aria-hidden>
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="h-2 w-2 rounded-full bg-[var(--color-accent)] opacity-40"
            style={{
              animation: 'install-wait-dot 1.2s ease-in-out infinite',
              animationDelay: `${index * 0.2}s`,
            }}
          />
        ))}
      </div>
      <p className="text-muted mt-4 text-xs">نصب {name} روی صفحهٔ اصلی</p>
    </div>
  );
}
