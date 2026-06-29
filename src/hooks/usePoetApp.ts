import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Poet } from '@/types/ganjoor';
import type { PoetFilter } from '@/types/ganjoor';
import { appendBrowseSessionToParams } from '@/utils/browseSession';
import { parseIdListParam, singleFilterId } from '@/utils/filterState';
import {
  computeIsPoetApp,
  computeLockPoet,
  resolveActivePoetId,
} from '@/utils/poetAppState';

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

function readPoetIdParam(): number | null {
  if (typeof window === 'undefined') return null;
  return singleFilterId(parseIdListParam(new URLSearchParams(window.location.search).get('poet'))) ?? null;
}

export function usePoetApp(
  poets: Poet[],
  urlPoetId: PoetFilter = 'all',
  urlSource: 'pwa' | null = null,
) {
  const [storedPoet, setStoredPoet] = useState<StoredPoet | null>(() => readStoredPoet());
  const [standalone, setStandalone] = useState(isStandaloneDisplay);

  const resolvedUrlPoetId = singleFilterId(urlPoetId) ?? null;

  useEffect(() => {
    function handleDisplayMode(event: MediaQueryListEvent) {
      setStandalone(event.matches || isStandaloneDisplay());
    }

    const mq = window.matchMedia('(display-mode: standalone)');
    mq.addEventListener('change', handleDisplayMode);
    return () => mq.removeEventListener('change', handleDisplayMode);
  }, []);

  useEffect(() => {
    if (!standalone || !storedPoet) return;
    if (resolvedUrlPoetId === storedPoet.id && urlSource === 'pwa') return;

    const base = import.meta.env.BASE_URL;
    const params = new URLSearchParams({
      poet: String(storedPoet.id),
      source: 'pwa',
      tab: 'browse',
    });
    appendBrowseSessionToParams(storedPoet.id, params);
    const target = `${base}?${params.toString()}`;
    const current = `${window.location.pathname}${window.location.search}`;
    if (current !== target) {
      window.location.replace(target);
    }
  }, [standalone, storedPoet, resolvedUrlPoetId, urlSource]);

  const activePoetId = resolveActivePoetId({
    urlPoetId,
    urlSource,
    urlPoetParam: readPoetIdParam(),
    standalone,
    storedPoet,
  });

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
    if (!resolvedUrlPoetId || !poet || !standalone) return;
    const next = {
      id: poet.id,
      name: poet.name || poet.fullName || 'شاعر',
      imageUrl: poet.imageUrl,
    };
    if (storedPoet?.id === next.id && storedPoet.name === next.name) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setStoredPoet(next);
  }, [resolvedUrlPoetId, poet, standalone, storedPoet]);

  const isPoetApp = computeIsPoetApp({
    activePoetId,
    urlSource,
    resolvedUrlPoetId,
    standalone,
    storedPoet,
  });

  const lockPoet = computeLockPoet({
    isPoetApp,
    standalone,
    urlSource,
  });

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
