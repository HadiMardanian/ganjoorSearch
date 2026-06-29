import { memo, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { formatDisplayTitle } from '@/utils/displayTitle';
import { GANJOOR_SITE } from '@/api/client';
import { fetchPoem } from '@/api/ganjoor';
import { HighlightedText } from './HighlightedText';
import { STALE_TIMES } from '@/lib/queryClient';
import type { GroupedResult, ViewMode } from '@/types/ganjoor';
import { Button } from '@/components/ui/Button';

interface ResultCardProps {
  result: GroupedResult;
  searchTerm: string;
  viewMode: ViewMode;
}

function getPoemText(result: GroupedResult): string {
  if (result.plainText) return result.plainText;
  return (result.allVerses ?? [])
    .map((verse) => verse.text || '')
    .filter(Boolean)
    .join('\n');
}

function linesFromHtmlText(htmlText: string): string[] {
  const stripped = htmlText
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\r/g, '');
  return stripped
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export const ResultCard = memo(function ResultCard({
  result,
  searchTerm,
  viewMode,
}: ResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fetchEnriched, setFetchEnriched] = useState(false);

  const poemQuery = useQuery({
    queryKey: ['poem', result.fullUrl],
    queryFn: ({ signal }) => fetchPoem(result.fullUrl, signal),
    enabled: fetchEnriched && Boolean(result.fullUrl),
    staleTime: STALE_TIMES.poem,
  });

  const enrichedLines = useMemo(() => {
    if (!poemQuery.data) return null;
    if (poemQuery.data.verses?.length) {
      return poemQuery.data.verses.map((verse) => verse.text || '').filter(Boolean);
    }
    if (poemQuery.data.htmlText) {
      return linesFromHtmlText(poemQuery.data.htmlText);
    }
    return poemQuery.data.plainText?.split(/\r?\n/).map((l) => l.trim()).filter(Boolean) ?? null;
  }, [poemQuery.data]);

  const displayLines = enrichedLines ?? getPoemText(result).split(/\r?\n/).filter(Boolean);

  const copyText = useMemo(() => {
    if (viewMode === 'verse') {
      return result.excerpt
        .filter((part) => part.type === 'line')
        .map((part) => part.text)
        .join('\n');
    }
    return displayLines.join('\n');
  }, [displayLines, result, viewMode]);

  useEffect(() => {
    if (expanded && viewMode === 'full' && result.fullUrl) {
      setFetchEnriched(true);
    }
  }, [expanded, result.fullUrl, viewMode]);

  async function handleCopy(id: string) {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = copyText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    }
  }

  const poemUrl = result.fullUrl ? `${GANJOOR_SITE}${result.fullUrl}` : GANJOOR_SITE;
  const copyKey = `${result.poemId}-${viewMode}`;
  const title = formatDisplayTitle(result.fullTitle || result.poemTitle);

  return (
    <article className="fade-in rounded-2xl border border-stone-300 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {result.poetImageUrl ? (
            <img
              src={result.poetImageUrl}
              alt={result.poetName ?? 'شاعر'}
              className="h-12 w-12 shrink-0 rounded-full border border-stone-200 object-cover"
              loading="lazy"
            />
          ) : null}
          <h3 className="text-base font-semibold leading-relaxed text-stone-900 sm:text-lg">
            <a
              href={poemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#9a3412] hover:underline"
            >
              {title}
            </a>
          </h3>
        </div>
        <a
          href={poemUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-stone-600 hover:text-[#9a3412] hover:underline"
        >
          مشاهده در گنجور
          <ExternalLink size={14} />
        </a>
      </div>

      {viewMode === 'verse' ? (
        <div className="space-y-2 rounded-xl bg-stone-50 p-4">
          {result.excerpt.map((part, index) =>
            part.type === 'ellipsis' ? (
              <p
                key={`${result.poemId}-ellipsis-${index}`}
                className="text-center text-stone-400"
              >
                ...
              </p>
            ) : part.type === 'note' ? (
              <p
                key={`${result.poemId}-note-${index}`}
                className="text-sm italic text-stone-600"
              >
                {part.text}
              </p>
            ) : (
              <HighlightedText
                key={`${result.poemId}-excerpt-${index}`}
                text={part.text}
                term={searchTerm}
                className="verse-text block text-base text-stone-900"
              />
            ),
          )}
        </div>
      ) : (
        <div>
          <div
            className={`space-y-2 ${expanded ? '' : 'max-h-48 overflow-hidden relative'}`}
          >
            {displayLines.map((line, index) => (
              <HighlightedText
                key={`${result.poemId}-line-${index}`}
                text={line}
                term={searchTerm}
                className="verse-text text-base text-stone-900"
              />
            ))}
            {!expanded && displayLines.length > 6 && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
            )}
            {poemQuery.isFetching && expanded ? (
              <p className="text-sm text-stone-500">در حال بارگذاری متن کامل…</p>
            ) : null}
          </div>
          {displayLines.length > 6 && (
            <button
              type="button"
              className="mt-3 rounded-full border border-[#9a3412] px-4 py-1.5 text-sm text-[#9a3412] hover:bg-orange-50"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
            >
              {expanded ? 'مشاهده کمتر' : 'مشاهده بیشتر'}
            </button>
          )}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button variant="secondary" onClick={() => handleCopy(copyKey)}>
          {copiedId === copyKey ? (
            <>
              <Check size={16} />
              کپی شد!
            </>
          ) : (
            <>
              <Copy size={16} />
              کپی کردن
            </>
          )}
        </Button>
      </div>
    </article>
  );
});
