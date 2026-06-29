export interface PagingMetadata {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export function parsePagingHeaders(response: Response): PagingMetadata | null {
  const raw = response.headers.get('paging-headers');
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PagingMetadata>;
    if (
      typeof parsed.totalCount !== 'number' ||
      typeof parsed.pageSize !== 'number' ||
      typeof parsed.currentPage !== 'number'
    ) {
      return null;
    }

    return {
      totalCount: parsed.totalCount,
      pageSize: parsed.pageSize,
      currentPage: parsed.currentPage,
      totalPages: parsed.totalPages ?? 0,
      hasPreviousPage: Boolean(parsed.hasPreviousPage),
      hasNextPage: Boolean(parsed.hasNextPage),
    };
  } catch {
    return null;
  }
}

export function formatPersianNumber(value: number): string {
  return value.toLocaleString('fa-IR');
}

export function formatResultRange(
  page: number,
  pageSize: number,
  pageCount: number,
  totalCount: number,
): string {
  if (totalCount <= 0 || pageCount <= 0) {
    return `${formatPersianNumber(pageCount)} قطعه در این صفحه`;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);
  return `نمایش ${formatPersianNumber(start)}–${formatPersianNumber(end)} از ${formatPersianNumber(totalCount)} قطعه`;
}
