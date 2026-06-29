export interface Poet {
  id: number;
  name: string;
  fullName?: string;
  description?: string;
  imageUrl?: string;
}

export interface Category {
  id: number;
  title: string;
  fullUrl?: string;
  urlSlug?: string;
  description?: string;
  children?: Category[];
  poemCount?: number;
}

export interface PoemSummary {
  id: number;
  title: string;
  urlSlug?: string;
  fullUrl?: string;
  excerpt?: string;
  fullTitle?: string;
}

export interface CategoryDetail extends Category {
  children: Category[];
  poems: PoemSummary[];
}

export interface PoetDetail {
  id: number;
  name: string;
  fullName?: string;
  description?: string;
  imageUrl?: string;
  fullUrl?: string;
  rootCatId?: number;
  nickname?: string;
}

export interface PoetWithCatalog {
  poet: PoetDetail;
  rootCategory: CategoryDetail;
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
  fullTitle?: string;
  fullUrl?: string;
  urlSlug?: string;
  verses?: Verse[];
  plainText?: string;
  htmlText?: string;
  category?: {
    poet?: {
      id?: number;
      name?: string;
      imageUrl?: string;
    };
  };
}

import type { ExcerptPart } from '@/utils/searchExcerpt';

export interface GroupedResult {
  poemId: number;
  poemTitle: string;
  fullTitle: string;
  fullUrl: string;
  urlSlug?: string;
  poetId?: number;
  poetName?: string;
  poetImageUrl?: string;
  allVerses: Verse[];
  plainText?: string;
  htmlText?: string;
  excerpt: ExcerptPart[];
  matchingCouplets: Array<{
    coupletIndex: number;
    verses: Verse[];
  }>;
  titleOnlyMatch?: boolean;
}

export interface SearchResponse {
  results: GroupedResult[];
  page: number;
  hasMore: boolean;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export type ViewMode = 'verse' | 'full';
export type PoetFilter = number | 'all';
export type CategoryFilter = number | 'all';
