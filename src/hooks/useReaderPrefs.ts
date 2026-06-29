import { useCallback, useEffect, useState } from 'react';

export type ReaderFontSize = 'sm' | 'md' | 'lg';
export type ReaderLineHeight = 'normal' | 'relaxed';

export interface ReaderPrefs {
  fontSize: ReaderFontSize;
  lineHeight: ReaderLineHeight;
}

const STORAGE_KEY = 'ganjoorsearch-reader-prefs';

const DEFAULT_PREFS: ReaderPrefs = {
  fontSize: 'md',
  lineHeight: 'relaxed',
};

function readPrefs(): ReaderPrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<ReaderPrefs>;
    return {
      fontSize:
        parsed.fontSize === 'sm' || parsed.fontSize === 'lg' ? parsed.fontSize : 'md',
      lineHeight: parsed.lineHeight === 'normal' ? 'normal' : 'relaxed',
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function useReaderPrefs() {
  const [prefs, setPrefs] = useState<ReaderPrefs>(() => readPrefs());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const setFontSize = useCallback((fontSize: ReaderFontSize) => {
    setPrefs((current) => ({ ...current, fontSize }));
  }, []);

  const setLineHeight = useCallback((lineHeight: ReaderLineHeight) => {
    setPrefs((current) => ({ ...current, lineHeight }));
  }, []);

  return { prefs, setFontSize, setLineHeight };
}

export const readerFontSizeClass: Record<ReaderFontSize, string> = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
};

export const readerLineHeightClass: Record<ReaderLineHeight, string> = {
  normal: 'leading-8',
  relaxed: 'leading-10',
};
