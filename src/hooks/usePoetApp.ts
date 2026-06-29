import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Poet } from '@/types/ganjoor';

const STORAGE_KEY = 'ganjoorsearch-installed-poet';

export interface StoredPoet {
  id: number;
  name: string;
  imageUrl?: string;
}

function readStoredPoet(): StoredPoet | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPoet;
    if (typeof parsed.id === 'number' && parsed.name) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  return Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

function readUrlPoetId(): number | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  if (params.get('source') !== 'pwa') return null;
  const poet = Number(params.get('poet'));
  return Number.isFinite(poet) && poet > 0 ? poet : null;
}

export function usePoetApp(poets: Poet[]) {
  const [storedPoet, setStoredPoet] = useState<StoredPoet | null>(() => readStoredPoet());
  const [urlPoetId, setUrlPoetId] = useState<number | null>(() => readUrlPoetId());
  const [standalone, setStandalone] = useState(isStandaloneDisplay);

  useEffect(() => {
    function sync() {
      setUrlPoetId(readUrlPoetId());
      setStoredPoet(readStoredPoet());
    }

    function handleDisplayMode(event: MediaQueryListEvent) {
      setStandalone(event.matches || isStandaloneDisplay());
    }

    window.addEventListener('popstate', sync);
    const mq = window.matchMedia('(display-mode: standalone)');
    mq.addEventListener('change', handleDisplayMode);

    return () => {
      window.removeEventListener('popstate', sync);
      mq.removeEventListener('change', handleDisplayMode);
    };
  }, []);

  const activePoetId = urlPoetId ?? (standalone ? storedPoet?.id ?? null : null) ?? null;

  const poet = useMemo(() => {
    if (!activePoetId) return null;
    const fromApi = poets.find((p) => p.id === activePoetId);
    if (fromApi) return fromApi;
    if (storedPoet && storedPoet.id === activePoetId) {
      return {
        id: storedPoet.id,
        name: storedPoet.name,
        imageUrl: storedPoet.imageUrl,
      };
    }
    return null;
  }, [activePoetId, poets, storedPoet]);

  useEffect(() => {
    if (!urlPoetId || !poet || !standalone) return;
    const next = {
      id: poet.id,
      name: poet.name || poet.fullName || 'شاعر',
      imageUrl: poet.imageUrl,
    };
    if (storedPoet?.id === next.id && storedPoet.name === next.name) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setStoredPoet(next);
  }, [urlPoetId, poet, standalone, storedPoet]);

  const isPoetApp = Boolean(
    activePoetId && (urlPoetId != null || (standalone && storedPoet != null)),
  );

  const lockPoet = Boolean(isPoetApp && (standalone || urlPoetId != null));

  const saveInstalledPoet = useCallback((next: StoredPoet) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setStoredPoet(next);
  }, []);

  const clearInstalledPoet = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setStoredPoet(null);
  }, []);

  return {
    isPoetApp,
    lockPoet,
    activePoetId,
    poet,
    storedPoet,
    saveInstalledPoet,
    clearInstalledPoet,
  };
}
