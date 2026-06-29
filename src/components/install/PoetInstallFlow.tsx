import { useEffect, useState } from 'react';
import type { Poet } from '@/types/ganjoor';
import { PoetInstallGallery } from '@/components/install/PoetInstallGallery';
import { PoetInstallPreview } from '@/components/install/PoetInstallPreview';
import { IosInstallGuide } from '@/components/install/IosInstallGuide';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { injectPoetManifest, restoreDefaultManifest } from '@/utils/poetManifest';
import { showToast } from '@/components/ui/Toast';

type Step = 'gallery' | 'preview' | 'ios';

interface PoetInstallFlowProps {
  open: boolean;
  poets: Poet[];
  poetsLoading?: boolean;
  initialPoetId?: number | null;
  onClose: () => void;
  onPoetInstalled: (poet: Poet) => void;
}

export function PoetInstallFlow({
  open,
  poets,
  poetsLoading,
  initialPoetId,
  onClose,
  onPoetInstalled,
}: PoetInstallFlowProps) {
  const { canInstall, isIos, promptInstall } = usePwaInstall();
  const [step, setStep] = useState<Step>('gallery');
  const [selectedPoet, setSelectedPoet] = useState<Poet | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep('gallery');
      setSelectedPoet(null);
      restoreDefaultManifest();
      return;
    }

    if (initialPoetId) {
      const poet = poets.find((p) => p.id === initialPoetId) ?? null;
      if (poet) {
        setSelectedPoet(poet);
        setStep('preview');
      }
    }
  }, [open, initialPoetId, poets]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!selectedPoet || step === 'gallery') return;
    injectPoetManifest(selectedPoet).catch(() => {
      showToast('خطا در آماده‌سازی آیکون شاعر.', 'error');
    });
  }, [selectedPoet, step]);

  if (!open) return null;

  function handleSelectPoet(poet: Poet) {
    setSelectedPoet(poet);
    setStep('preview');
  }

  async function handleInstall() {
    if (!selectedPoet) return;
    setInstalling(true);
    try {
      await injectPoetManifest(selectedPoet);
      const outcome = await promptInstall();
      if (outcome === 'accepted') {
        onPoetInstalled(selectedPoet);
        showToast(`اپ ${selectedPoet.name} نصب شد.`, 'success');
        onClose();
      } else if (outcome === 'dismissed') {
        showToast('نصب لغو شد.', 'info');
      } else {
        showToast('نصب در این مرورگر در دسترس نیست.', 'info');
      }
    } finally {
      setInstalling(false);
    }
  }

  function handleIosDone() {
    if (selectedPoet) {
      onPoetInstalled(selectedPoet);
      showToast(`برای ${selectedPoet.name} به صفحهٔ اصلی اضافه کنید.`, 'success');
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="poet-install-title"
      onClick={onClose}
    >
      <div
        className="surface-card flex h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border shadow-2xl sm:h-[min(720px,90vh)] sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <span id="poet-install-title" className="sr-only">
          نصب اپ شاعر دلخواه
        </span>
        {step === 'gallery' && (
          <PoetInstallGallery
            poets={poets}
            loading={poetsLoading}
            onSelect={handleSelectPoet}
            onClose={onClose}
          />
        )}
        {step === 'preview' && selectedPoet && (
          <PoetInstallPreview
            poet={selectedPoet}
            canInstall={canInstall}
            isIos={isIos}
            installing={installing}
            onInstall={handleInstall}
            onIosGuide={() => setStep('ios')}
            onBack={() => setStep('gallery')}
          />
        )}
        {step === 'ios' && selectedPoet && (
          <IosInstallGuide
            poet={selectedPoet}
            onDone={handleIosDone}
            onBack={() => setStep('preview')}
          />
        )}
      </div>
    </div>
  );
}
