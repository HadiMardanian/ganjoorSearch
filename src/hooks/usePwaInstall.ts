import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PROMPT_TIMEOUT_MS = 20_000;

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  const mq = window.matchMedia('(display-mode: standalone)');
  if (mq.matches) return true;
  return Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => window.setTimeout(() => resolve(fallback), ms)),
  ]);
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [isInstalled, setIsInstalled] = useState(isStandaloneDisplay);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIos(/iPad|iPhone|iPod/.test(ua) && !('MSStream' in window));

    function handleBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }

    function handleDisplayMode(event: MediaQueryListEvent) {
      if (event.matches) setIsInstalled(true);
    }

    const mq = window.matchMedia('(display-mode: standalone)');
    mq.addEventListener('change', handleDisplayMode);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      mq.removeEventListener('change', handleDisplayMode);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const canInstall = Boolean(deferredPrompt) && !isInstalled;
  const showInstallCta = !isInstalled;

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable';

    try {
      await deferredPrompt.prompt();
      const { outcome } = await withTimeout(
        deferredPrompt.userChoice,
        PROMPT_TIMEOUT_MS,
        { outcome: 'dismissed' as const },
      );
      setDeferredPrompt(null);
      if (outcome === 'accepted') setIsInstalled(true);
      return outcome;
    } catch {
      setDeferredPrompt(null);
      return 'unavailable';
    }
  }, [deferredPrompt]);

  return {
    canInstall,
    isInstalled,
    isIos,
    showInstallCta,
    promptInstall,
  };
}
