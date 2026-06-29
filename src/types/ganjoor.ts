export interface Poet {
  id: number;
  name: string;
  fullName?: string;
  description?: string;
}

export interface Category {
  id: number;
  title: string;
  fullUrl?: string;
}

export interface Verse {
  id: number;
  vOrder: number;
  coupletIndex?: number;
  text: string;
  sectionIndex1?: number;
}

export interface Poem {
  id: number;
  title: string;
  fullUrl?: string;
  urlSlug?: string;
  verses?: Verse[];
  plainText?: string;
  htmlText?: string;
}

export interface SearchResult {
  poemId: number;
  poemTitle: string;
  fullUrl: string;
  urlSlug?: string;
  matchingVerses: Verse[];
  allVerses: Verse[];
  plainText?: string;
  htmlText?: string;
  coupletIndex: number;
}

export interface GroupedResult {
  poemId: number;
  poemTitle: string;
  fullUrl: string;
  urlSlug?: string;
  allVerses: Verse[];
  plainText?: string;
  htmlText?: string;
  matchingCouplets: Array<{
    coupletIndex: number;
    verses: Verse[];
  }>;
}

export interface SearchResponse {
  results: GroupedResult[];
  page: number;
  hasMore: boolean;
  pageSize: number;
}

export type ViewMode = 'verse' | 'full';
export type PoetFilter = number | 'all';
export type CategoryFilter = number | 'all';
