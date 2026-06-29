import { Share, PlusSquare, CheckCircle2, ArrowRight } from 'lucide-react';
import type { Poet } from '@/types/ganjoor';
import { PoetAvatar } from '@/components/install/PoetAvatar';
import { Button } from '@/components/ui/Button';

interface IosInstallGuideProps {
  poet: Poet;
  onDismiss: () => void;
  onInstalled: () => void;
  onBack: () => void;
}

const steps = [
  {
    icon: Share,
    title: 'دکمهٔ Share را بزنید',
    description: 'در Safari پایین صفحه، آیکن اشتراک‌گذاری (مربع با فلش بالا) را لمس کنید.',
  },
  {
    icon: PlusSquare,
    title: 'Add to Home Screen',
    description: 'در منو گزینهٔ «Add to Home Screen» یا «افزودن به صفحهٔ اصلی» را انتخاب کنید.',
  },
  {
    icon: CheckCircle2,
    title: 'تأیید نام و آیکون',
    description: 'نام شاعر و آیکون را بررسی کنید و «Add» را بزنید.',
  },
];

export function IosInstallGuide({ poet, onDismiss, onInstalled, onBack }: IosInstallGuideProps) {
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
          بازگشت
        </button>
        <div className="flex items-center gap-4">
          <PoetAvatar poet={poet} size="md" />
          <div>
            <h2 className="text-xl font-bold">افزودن {name} به صفحهٔ اصلی</h2>
            <p className="text-muted mt-1 text-sm">راهنمای سه‌مرحله‌ای iOS / Safari</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="surface-card flex gap-4 rounded-2xl border p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-accent">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-subtle text-xs font-semibold">مرحله {index + 1}</p>
                <h3 className="mt-1 font-semibold" dir={/[A-Za-z]/.test(step.title) ? 'ltr' : undefined}>
                  {step.title}
                </h3>
                <p
                  className="text-muted mt-1 text-sm leading-6"
                  dir={/[A-Za-z]/.test(step.description) ? 'ltr' : undefined}
                >
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}

        <div className="surface-muted rounded-xl border p-4 text-sm">
          <p>
            پس از افزودن، آیکون <strong>{name}</strong> روی صفحهٔ اصلی ظاهر می‌شود و با باز کردن
            آن مستقیم وارد مرور و مطالعهٔ آثار همان شاعر می‌شوید.
          </p>
        </div>
      </div>

      <div className="border-t px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-2">
          <Button type="button" className="w-full py-3" onClick={onInstalled}>
            به صفحهٔ اصلی اضافه کردم
          </Button>
          <Button type="button" variant="secondary" className="w-full py-3" onClick={onDismiss}>
            متوجه شدم — بعداً
          </Button>
        </div>
      </div>
    </div>
  );
}
