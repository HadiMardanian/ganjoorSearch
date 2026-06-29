import type { PoetFilter } from '@/types/ganjoor';
import type { StoredPoet } from '@/hooks/usePoetApp';

export function resolveActivePoetId(options: {
  urlPoetId: PoetFilter;
  urlSource: 'pwa' | null;
  urlPoetParam: number | null;
  standalone: boolean;
  storedPoet: StoredPoet | null;
}): number | null {
  const resolvedUrlPoetId =
    options.urlPoetId !== 'all' && typeof options.urlPoetId === 'number'
      ? options.urlPoetId
      : null;

  return (
    resolvedUrlPoetId ??
    (options.urlSource === 'pwa' ? options.urlPoetParam : null) ??
    (options.standalone ? options.storedPoet?.id ?? null : null) ??
    options.storedPoet?.id ??
    null
  );
}

export function computeIsPoetApp(options: {
  activePoetId: number | null;
  urlSource: 'pwa' | null;
  resolvedUrlPoetId: number | null;
  standalone: boolean;
  storedPoet: StoredPoet | null;
}): boolean {
  return Boolean(
    options.activePoetId &&
      (options.urlSource === 'pwa' ||
        options.resolvedUrlPoetId != null ||
        (options.standalone && options.storedPoet != null) ||
        options.storedPoet?.id === options.activePoetId),
  );
}

export function computeLockPoet(options: {
  isPoetApp: boolean;
  standalone: boolean;
  urlSource: 'pwa' | null;
  resolvedUrlPoetId: number | null;
}): boolean {
  return Boolean(
    options.isPoetApp &&
      (options.standalone ||
        options.urlSource === 'pwa' ||
        options.resolvedUrlPoetId != null),
  );
}
