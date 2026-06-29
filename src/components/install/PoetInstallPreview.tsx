import { ArrowRight, Check, Download, Smartphone } from 'lucide-react';
import type { Poet } from '@/types/ganjoor';
import { PoetAvatar } from '@/components/install/PoetAvatar';
import { Button } from '@/components/ui/Button';

interface PoetInstallPreviewProps {
  poet: Poet;
  canInstall: boolean;
  isIos: boolean;
  alreadyInstalled?: boolean;
  installing?: boolean;
  onInstall: () => void;
  onUseWithoutInstall: () => void;
  onIosGuide: () => void;
  onBack: () => void;
}

const benefits = [
  'آیکون با عکس شاعر روی صفحهٔ اصلی',
  'مرور و مطالعهٔ آثار مثل اپ گنجور',
  'جستجو در اشعار همان شاعر',
];

export function PoetInstallPreview({
  poet,
  canInstall,
  isIos,
  alreadyInstalled,
  installing,
  onInstall,
  onUseWithoutInstall,
  onIosGuide,
  onBack,
}: PoetInstallPreviewProps) {
  const name = poet.name || poet.fullName || 'شاعر';

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <button
          type="button"
          className="text-muted hover:text-[var(--color-ink)] mb-3 inline-flex items-center gap-1 text-sm"
          onClick={onBack}
        >
          <ArrowRight size={16} />
          بازگشت به گالری
        </button>
        <div className="flex flex-col items-center text-center">
          <PoetAvatar poet={poet} size="lg" className="mb-4" />
          <h2 className="text-2xl font-bold">{name}</h2>
          <p className="text-muted mt-2 text-sm">جستجوی اشعار {name} روی گوشی</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <ul className="space-y-3">
          {benefits.map((text) => (
            <li key={text} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-accent">
                <Check size={14} />
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 space-y-3">
          {alreadyInstalled ? (
            <div className="surface-muted rounded-xl border p-4 text-sm">
              <p className="font-medium">اپ {name} قبلاً نصب شده</p>
              <p className="text-muted mt-2">
                از آیکون صفحهٔ اصلی همان شاعر را باز کنید، یا شاعر دیگری را نصب کنید.
              </p>
            </div>
          ) : null}

          <Button
            type="button"
            variant="secondary"
            className="w-full py-3 text-base"
            onClick={onUseWithoutInstall}
            disabled={installing}
          >
            شروع مرور آثار {name}
          </Button>

          {canInstall && !alreadyInstalled ? (
            <Button
              type="button"
              className="w-full py-3 text-base"
              onClick={onInstall}
              disabled={installing}
            >
              <Download size={18} />
              {installing ? 'در حال نصب…' : `نصب اپ ${name}`}
            </Button>
          ) : isIos && !alreadyInstalled ? (
            <Button type="button" className="w-full py-3 text-base" onClick={onIosGuide}>
              <Smartphone size={18} />
              راهنمای افزودن به صفحهٔ اصلی
            </Button>
          ) : !alreadyInstalled ? (
            <div className="surface-muted rounded-xl border p-4 text-sm">
              <p className="font-medium">نصب از مرورگر</p>
              <p className="text-muted mt-2">
                در Chrome اندروید دکمهٔ نصب ظاهر می‌شود. در مرورگر دسکتاپ از منوی مرورگر
                «نصب اپ» یا «Install app» را انتخاب کنید.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="mt-4 w-full"
                onClick={onIosGuide}
              >
                راهنمای iOS / Safari
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
