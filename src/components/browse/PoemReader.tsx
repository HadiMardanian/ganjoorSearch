import { useMemo } from 'react';
import { Check, ChevronLeft, ChevronRight, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { GANJOOR_SITE } from '@/api/client';
import { usePoemDetailQuery } from '@/api/queries';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import type { PoemSummary } from '@/types/ganjoor';
import { poemToLines } from '@/utils/poemText';

interface PoemReaderProps {
  poemUrl: string;
  poems?: PoemSummary[];
  onBack: () => void;
  onNavigate?: (poemUrl: string) => void;
}

export function PoemReader({ poemUrl, poems = [], onBack, onNavigate }: PoemReaderProps) {
  const poemQuery = usePoemDetailQuery(poemUrl);
  const [copied, setCopied] = useState(false);

  const lines = useMemo(() => {
    if (!poemQuery.data) return [];
    return poemToLines(poemQuery.data);
  }, [poemQuery.data]);

  const currentIndex = poems.findIndex((poem) => poem.fullUrl === poemUrl);
  const prevPoem = currentIndex > 0 ? poems[currentIndex - 1] : null;
  const nextPoem =
    currentIndex >= 0 && currentIndex < poems.length - 1
      ? poems[currentIndex + 1]
      : null;

  const title =
    poemQuery.data?.fullTitle || poemQuery.data?.title || 'در حال بارگذاری…';
  const externalUrl = `${GANJOOR_SITE}${poemUrl}`;

  async function handleCopy() {
    const text = `${title}\n\n${lines.join('\n')}\n\n${externalUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <article className="surface-card rounded-2xl border p-5 shadow-sm sm:p-8">
      <button
        type="button"
        className="text-muted hover:text-[var(--color-ink)] mb-4 inline-flex items-center gap-1 text-sm"
        onClick={onBack}
      >
        <ChevronLeft size={16} />
        بازگشت به فهرست
      </button>

      {poemQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-5 w-full" />
          ))}
        </div>
      ) : poemQuery.error ? (
        <p className="text-center text-sm text-red-700">خطا در بارگذاری شعر.</p>
      ) : (
        <>
          <header className="mb-6 border-b pb-5">
            <h2 className="text-xl font-bold leading-relaxed sm:text-2xl">{title}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={handleCopy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'کپی شد' : 'کپی متن'}
              </Button>
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
              >
                <ExternalLink size={16} />
                مشاهده در گنجور
              </a>
            </div>
          </header>

          <div className="poem-reader space-y-3">
            {lines.map((line, index) => (
              <p key={`${poemUrl}-line-${index}`} className="verse-text text-lg leading-10">
                {line}
              </p>
            ))}
          </div>

          {(prevPoem || nextPoem) && onNavigate ? (
            <div className="mt-8 flex flex-wrap justify-between gap-3 border-t pt-5">
              {prevPoem?.fullUrl ? (
                <Button
                  variant="secondary"
                  onClick={() => onNavigate(prevPoem.fullUrl!)}
                >
                  <ChevronRight size={16} />
                  {prevPoem.title}
                </Button>
              ) : (
                <span />
              )}
              {nextPoem?.fullUrl ? (
                <Button
                  variant="secondary"
                  onClick={() => onNavigate(nextPoem.fullUrl!)}
                >
                  {nextPoem.title}
                  <ChevronLeft size={16} />
                </Button>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </article>
  );
}
