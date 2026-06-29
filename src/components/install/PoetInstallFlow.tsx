import { useEffect, useRef, useState } from 'react';
import type { Poet } from '@/types/ganjoor';
import { PoetInstallGallery } from '@/components/install/PoetInstallGallery';
import { PoetInstallPreview } from '@/components/install/PoetInstallPreview';
import { IosInstallGuide } from '@/components/install/IosInstallGuide';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { recordInstalledPoetId } from '@/utils/installedPoets';
import { isPoetPwaInstalled } from '@/utils/poetPwaInstall';
import { buildPoetInstallUrl, clearInstallParamFromUrl } from '@/utils/poetInstallUrl';
import {
  injectPoetManifest,
  lockPoetManifestForInstall,
  restoreDefaultManifest,
  unlockPoetManifestForInstall,
} from '@/utils/poetManifest';
import { showToast } from '@/components/ui/Toast';

type Step = 'gallery' | 'preview' | 'ios';

const INSTALL_PROMPT_WAIT_MS = 12_000;

interface PoetInstallFlowProps {
  open: boolean;
  poets: Poet[];
  poetsLoading?: boolean;
  initialPoetId?: number | null;
  onClose: () => void;
  onPoetInstalled: (poet: Poet) => void;
  onBrowseWithoutInstall: (poet: Poet) => void;
}

export function PoetInstallFlow({
  open,
  poets,
  poetsLoading,
  initialPoetId,
  onClose,
  onPoetInstalled,
  onBrowseWithoutInstall,
}: PoetInstallFlowProps) {
  const { canInstall, isIos, promptInstall } = usePwaInstall();
  const [step, setStep] = useState<Step>('gallery');
  const [selectedPoet, setSelectedPoet] = useState<Poet | null>(null);
  const [installing, setInstalling] = useState(false);
  const [poetAlreadyInstalled, setPoetAlreadyInstalled] = useState(false);
  const [manifestReady, setManifestReady] = useState(false);
  const [installPromptTimedOut, setInstallPromptTimedOut] = useState(false);
  const userPickedPoetRef = useRef(false);
  const activatedPoetRef = useRef(false);

  useEffect(() => {
    if (!open) {
      const wasActivated = activatedPoetRef.current;
      setStep('gallery');
      setSelectedPoet(null);
      setInstalling(false);
      setManifestReady(false);
      setInstallPromptTimedOut(false);
      userPickedPoetRef.current = false;
      activatedPoetRef.current = false;
      unlockPoetManifestForInstall();
      if (!wasActivated) {
        restoreDefaultManifest();
      }
      return;
    }

    if (initialPoetId && !userPickedPoetRef.current) {
      const poet = poets.find((p) => p.id === initialPoetId) ?? null;
      if (poet) {
        setSelectedPoet(poet);
        setStep('preview');
      }
    }
  }, [open, initialPoetId, poets]);

  useEffect(() => {
    if (!open || !selectedPoet || step === 'gallery') {
      setPoetAlreadyInstalled(false);
      return;
    }

    let cancelled = false;
    void isPoetPwaInstalled(selectedPoet.id).then((installed) => {
      if (!cancelled) setPoetAlreadyInstalled(installed);
    });

    return () => {
      cancelled = true;
    };
  }, [open, selectedPoet, step]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !installing) onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose, installing]);

  useEffect(() => {
    if (!open || !selectedPoet || step === 'gallery') {
      setManifestReady(false);
      return;
    }

    let cancelled = false;
    setManifestReady(false);
    lockPoetManifestForInstall();
    injectPoetManifest(selectedPoet)
      .then(() => {
        if (!cancelled) setManifestReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          showToast('خطا در آماده‌سازی آیکون شاعر.', 'error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, selectedPoet, step]);

  useEffect(() => {
    if (
      !open ||
      step !== 'preview' ||
      isIos ||
      poetAlreadyInstalled ||
      canInstall ||
      installing
    ) {
      setInstallPromptTimedOut(false);
      return;
    }

    setInstallPromptTimedOut(false);
    const timer = window.setTimeout(() => setInstallPromptTimedOut(true), INSTALL_PROMPT_WAIT_MS);
    return () => window.clearTimeout(timer);
  }, [
    open,
    step,
    isIos,
    poetAlreadyInstalled,
    canInstall,
    installing,
    selectedPoet?.id,
  ]);

  const waitingForInstallButton =
    step === 'preview' &&
    !poetAlreadyInstalled &&
    !isIos &&
    !canInstall &&
    !installing &&
    (!manifestReady || !installPromptTimedOut);

  if (!open) return null;

  function handleDismiss() {
    clearInstallParamFromUrl();
    restoreDefaultManifest();
    onClose();
  }

  function handleSelectPoet(poet: Poet) {
    userPickedPoetRef.current = true;
    window.location.assign(buildPoetInstallUrl(poet.id));
  }

  async function handleInstall() {
    if (!selectedPoet || installing) return;
    setInstalling(true);
    lockPoetManifestForInstall();

    try {
      await injectPoetManifest(selectedPoet);
      const outcome = await promptInstall();

      if (outcome === 'accepted') {
        recordInstalledPoetId(selectedPoet.id);
        clearInstallParamFromUrl();
        restoreDefaultManifest();
        onPoetInstalled(selectedPoet);
        onClose();
        showToast(`اپ ${selectedPoet.name} نصب شد. از آیکون صفحهٔ اصلی باز کنید.`, 'success');
      } else if (outcome === 'dismissed') {
        showToast('نصب لغو شد.', 'info');
      } else {
        showToast('برای نصب این شاعر صفحه را تازه کنید یا از منوی مرورگر «نصب اپ» را بزنید.', 'info');
      }
    } catch {
      showToast('خطا در نصب — دوباره تلاش کنید.', 'error');
    } finally {
      setInstalling(false);
      unlockPoetManifestForInstall();
    }
  }

  function handleReloadForInstall() {
    if (!selectedPoet) return;
    window.location.assign(buildPoetInstallUrl(selectedPoet.id));
  }

  function handleUseWithoutInstall() {
    if (!selectedPoet) return;
    activatedPoetRef.current = true;
    clearInstallParamFromUrl();
    onBrowseWithoutInstall(selectedPoet);
    onClose();
    showToast(`مرور آثار ${selectedPoet.name} در مرورگر آماده است.`, 'success');
  }

  function handleIosInstalled() {
    if (selectedPoet) {
      recordInstalledPoetId(selectedPoet.id);
      clearInstallParamFromUrl();
      onPoetInstalled(selectedPoet);
      restoreDefaultManifest();
      showToast(`اپ ${selectedPoet.name} آماده است — از صفحهٔ اصلی باز کنید.`, 'success');
    }
    onClose();
  }

  function handleIosDismiss() {
    handleDismiss();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="poet-install-title"
      onClick={installing ? undefined : handleDismiss}
    >
      <div
        className="surface-card flex h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border shadow-2xl sm:h-[min(720px,90vh)] sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-center pt-3 sm:hidden">
          <span className="h-1.5 w-10 rounded-full bg-[var(--color-border)]" aria-hidden />
        </div>
        <span id="poet-install-title" className="sr-only">
          نصب اپ شاعر دلخواه
        </span>
        {step === 'gallery' && (
          <PoetInstallGallery
            poets={poets}
            loading={poetsLoading}
            onSelect={handleSelectPoet}
            onClose={handleDismiss}
          />
        )}
        {step === 'preview' && selectedPoet && (
          <PoetInstallPreview
            poet={selectedPoet}
            canInstall={canInstall}
            isIos={isIos}
            alreadyInstalled={poetAlreadyInstalled}
            installing={installing}
            waitingForInstall={waitingForInstallButton}
            installWaitPhase={manifestReady ? 'prompt' : 'manifest'}
            onInstall={handleInstall}
            onReloadForInstall={handleReloadForInstall}
            onUseWithoutInstall={handleUseWithoutInstall}
            onIosGuide={() => setStep('ios')}
            onBack={() => {
              clearInstallParamFromUrl();
              setStep('gallery');
            }}
          />
        )}
        {step === 'ios' && selectedPoet && (
          <IosInstallGuide
            poet={selectedPoet}
            onInstalled={handleIosInstalled}
            onDismiss={handleIosDismiss}
            onBack={() => setStep('preview')}
          />
        )}
      </div>
    </div>
  );
}
