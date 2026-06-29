import { formatBrowsePath } from '@/utils/browsePath';
import { singleFilterId } from '@/utils/filterState';

export type BrowseSessionTab = 'browse' | 'search';

export interface BrowseSession {
  tab: BrowseSessionTab;
  browsePath: number[];
  poemListPage: number;
  poemUrl: string | null;
  searchTerm: string;
}

function storageKey(poetId: number) {
  return `ganjoorsearch-browse-session-${poetId}`;
}

export function saveBrowseSession(poetId: number, session: BrowseSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      storageKey(poetId),
      JSON.stringify({ ...session, savedAt: Date.now() }),
    );
  } catch {
    /* ignore quota errors */
  }
}

export function readBrowseSession(poetId: number): BrowseSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(poetId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BrowseSession;
    if (!Array.isArray(parsed.browsePath)) return null;
    return {
      tab: parsed.tab === 'search' ? 'search' : 'browse',
      browsePath: parsed.browsePath.filter(
        (id) => typeof id === 'number' && Number.isFinite(id) && id > 0,
      ),
      poemListPage:
        typeof parsed.poemListPage === 'number' && parsed.poemListPage > 0
          ? parsed.poemListPage
          : 1,
      poemUrl: typeof parsed.poemUrl === 'string' ? parsed.poemUrl : null,
      searchTerm: typeof parsed.searchTerm === 'string' ? parsed.searchTerm : '',
    };
  } catch {
    return null;
  }
}

export function clearBrowseSession(poetId: number): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(storageKey(poetId));
}

export function isDefaultPoetAppLaunch(state: {
  browsePath: number[];
  poemListPage: number;
  poemUrl: string | null;
  term: string;
}): boolean {
  return (
    state.browsePath.length === 0 &&
    state.poemListPage === 1 &&
    !state.poemUrl &&
    !state.term.trim()
  );
}

export function appendBrowseSessionToParams(
  poetId: number,
  params: URLSearchParams,
): void {
  const session = readBrowseSession(poetId);
  if (!session) return;

  if (session.tab === 'search') params.set('tab', 'search');
  else params.set('tab', 'browse');

  const bpath = formatBrowsePath(session.browsePath);
  if (bpath) params.set('bpath', bpath);
  if (session.poemListPage > 1) params.set('plist', String(session.poemListPage));
  if (session.poemUrl) params.set('poem', session.poemUrl);
  if (session.searchTerm.trim()) params.set('q', session.searchTerm.trim());
}

export function mergeBrowseSessionIntoState<T extends {
  poetId: import('@/types/ganjoor').PoetFilter;
  source: 'pwa' | null;
  tab: BrowseSessionTab;
  browsePath: number[];
  poemListPage: number;
  poemUrl: string | null;
  term: string;
}>(state: T): T {
  const poetId = singleFilterId(state.poetId);
  if (state.source !== 'pwa' || poetId == null) return state;
  if (!isDefaultPoetAppLaunch(state)) return state;

  const session = readBrowseSession(poetId);
  if (!session) return state;

  return {
    ...state,
    tab: session.tab,
    browsePath: session.browsePath,
    poemListPage: session.poemListPage,
    poemUrl: session.poemUrl,
    term: session.searchTerm,
  };
}
