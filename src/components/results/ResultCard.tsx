import { memo, useMemo, useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { GANJOOR_SITE } from '@/api/client';
import { usePoemVersesQuery } from '@/api/queries';
import { useInView } from '@/hooks/useInView';
import { enhanceGroupedWithVerses } from '@/utils/searchMap';
import { HighlightedText } from './HighlightedText';
import { VerseHighlight } from './VerseHighlight';
import type { GroupedResult, ViewMode } from '@/types/ganjoor';
import { Button } from '@/components/ui/Button';

interface ResultCardProps {
  result: GroupedResult;
  searchTerm: string;
  viewMode: ViewMode;
  eagerLoad?: boolean;
}

function getPoemText(result: GroupedResult): string {
  if (result.plainText) return result.plainText;
  return (result.allVerses ?? [])
    .map((verse) => verse.text || '')
    .filter(Boolean)
    .join('\n');
}

export const ResultCard = memo(function ResultCard({
  result,
  searchTerm,
  viewMode,
  eagerLoad = false,
}: ResultCardProps) {
  const { ref, inView } = useInView<HTMLElement>('300px');
  const [expanded, setExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const shouldLoadVerses = eagerLoad || inView || viewMode === 'full';
  const versesQuery = usePoemVersesQuery(result.poemId, shouldLoadVerses);

  const displayResult = useMemo(() => {
    if (!versesQuery.data?.length) return result;
    return enhanceGroupedWithVerses(result, versesQuery.data, searchTerm);
  }, [result, versesQuery.data, searchTerm]);

  const copyText = useMemo(() => {
    if (viewMode === 'verse') {
      return displayResult.matchingCouplets
        .map((couplet) =>
          couplet.verses.map((verse) => verse.text || '').join('\n'),
        )
        .join('\n\n');
    }
    return getPoemText(displayResult);
  }, [displayResult, viewMode]);

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
  const plainLines = (displayResult.plainText || getPoemText(displayResult))
    .split(/\r?\n/)
    .filter(Boolean);

  return (
    <article
      ref={ref}
      className="fade-in rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-stone-700 dark:bg-stone-800 sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          {displayResult.poemTitle}
        </h3>
        <a
          href={poemUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          مشاهده در گنجور
          <ExternalLink size={14} />
        </a>
      </div>

      {viewMode === 'verse' ? (
        <div className="space-y-4">
          {displayResult.matchingCouplets.map((couplet) => (
            <div
              key={`${displayResult.poemId}-${couplet.coupletIndex}`}
              className="rounded-xl border-r-4 border-accent bg-stone-50 p-4 dark:bg-stone-900/50"
            >
              <VerseHighlight verses={couplet.verses} searchTerm={searchTerm} />
            </div>
          ))}
          <p className="text-center text-sm text-stone-500">
            {displayResult.matchingCouplets.length} بیت در این غزل یافت شد
          </p>
        </div>
      ) : (
        <div>
          <div
            className={`space-y-2 ${expanded ? '' : 'max-h-48 overflow-hidden relative'}`}
          >
            {(displayResult.allVerses.length > 0
              ? displayResult.allVerses
              : plainLines.map((text, index) => ({
                  id: displayResult.poemId * 10_000 + index,
                  vOrder: index,
                  text,
                }))
            ).map((verse) => (
              <HighlightedText
                key={verse.id}
                text={verse.text || ''}
                term={searchTerm}
                className="verse-text text-base text-stone-800 dark:text-stone-100"
              />
            ))}
            {!expanded && plainLines.length > 6 && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent dark:from-stone-800" />
            )}
          </div>
          {plainLines.length > 6 && (
            <button
              type="button"
              className="mt-3 rounded-full border border-accent px-4 py-1.5 text-sm text-accent hover:bg-amber-50"
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? 'مشاهده کمتر' : 'مشاهده بیشتر'}
            </button>
          )}
        </div>
      )}

      {versesQuery.isFetching && !versesQuery.data && (
        <p className="mt-3 text-center text-xs text-stone-400">در حال بارگذاری جزئیات...</p>
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
