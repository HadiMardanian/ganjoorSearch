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

  async function handleCopy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
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

  const richCopyText = useMemo(() => {
    return `${title}\n\n${copyText}\n\n${poemUrl}`;
  }, [copyText, poemUrl, title]);

  return (
    <article className="surface-card fade-in rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {result.poetImageUrl ? (
            <img
              src={result.poetImageUrl}
              alt={result.poetName ?? 'شاعر'}
              className="h-12 w-12 shrink-0 rounded-full border border-[var(--color-border)] object-cover"
              loading="lazy"
            />
          ) : null}
          <h3 className="text-base font-semibold leading-relaxed sm:text-lg">
            <a
              href={poemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {title}
            </a>
          </h3>
        </div>
        <a
          href={poemUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted inline-flex shrink-0 items-center gap-1 text-sm font-medium hover:text-accent hover:underline"
        >
          مشاهده در گنجور
          <ExternalLink size={14} />
        </a>
      </div>

      {viewMode === 'verse' ? (
        <div className="surface-muted space-y-2 rounded-xl p-4">
          {result.excerpt.map((part, index) =>
            part.type === 'ellipsis' ? (
              <p
                key={`${result.poemId}-ellipsis-${index}`}
                className="text-subtle text-center"
              >
                ...
              </p>
            ) : part.type === 'note' ? (
              <p
                key={`${result.poemId}-note-${index}`}
                className="text-muted text-sm italic"
              >
                {part.text}
              </p>
            ) : (
              <HighlightedText
                key={`${result.poemId}-excerpt-${index}`}
                text={part.text}
                term={searchTerm}
                className="verse-text block text-base"
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
                className="verse-text text-base"
              />
            ))}
            {!expanded && displayLines.length > 6 && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--color-card)] to-transparent" />
            )}
            {poemQuery.isFetching && expanded ? (
              <p className="text-subtle text-sm">در حال بارگذاری متن کامل…</p>
            ) : null}
          </div>
          {displayLines.length > 6 && (
            <button
              type="button"
              className="mt-3 rounded-full border border-[var(--color-accent)] px-4 py-1.5 text-sm text-accent hover:bg-[var(--color-accent-soft)]"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
            >
              {expanded ? 'مشاهده کمتر' : 'مشاهده بیشتر'}
            </button>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <span className="sr-only" aria-live="polite">
          {copiedId === copyKey ? 'متن در حافظه کپی شد' : ''}
        </span>
        <Button variant="secondary" onClick={() => handleCopy(copyKey, copyText)}>
          {copiedId === copyKey ? (
            <>
              <Check size={16} />
              کپی شد!
            </>
          ) : (
            <>
              <Copy size={16} />
              کپی متن
            </>
          )}
        </Button>
        <Button variant="secondary" onClick={() => handleCopy(`${copyKey}-rich`, richCopyText)}>
          <Copy size={16} />
          کپی با لینک
        </Button>
      </div>
    </article>
  );
});
