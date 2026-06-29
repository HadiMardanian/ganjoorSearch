import type { PoetFilter } from '@/types/ganjoor';
import type { StoredPoet } from '@/hooks/usePoetApp';
import { singleFilterId } from '@/utils/filterState';

export function resolveActivePoetId(options: {
  urlPoetId: PoetFilter;
  urlSource: 'pwa' | null;
  urlPoetParam: number | null;
  standalone: boolean;
  storedPoet: StoredPoet | null;
}): number | null {
  const resolvedUrlPoetId = singleFilterId(options.urlPoetId) ?? null;

  return (
    resolvedUrlPoetId ??
    (options.urlSource === 'pwa' ? options.urlPoetParam : null) ??
    (options.standalone ? options.storedPoet?.id ?? null : null)
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
        (options.standalone &&
          (options.resolvedUrlPoetId != null || options.storedPoet != null))),
  );
}

export function computeLockPoet(options: {
  isPoetApp: boolean;
  standalone: boolean;
  urlSource: 'pwa' | null;
}): boolean {
  return Boolean(
    options.isPoetApp && (options.standalone || options.urlSource === 'pwa'),
  );
}

/** Standalone launch should trust manifest start_url (?poet=) over last-installed localStorage. */
export function shouldStandaloneRedirectToStoredPoet(options: {
  standalone: boolean;
  resolvedUrlPoetId: number | null;
  storedPoet: StoredPoet | null;
}): boolean {
  if (!options.standalone || !options.storedPoet) return false;
  if (options.resolvedUrlPoetId != null) return false;
  return true;
}
