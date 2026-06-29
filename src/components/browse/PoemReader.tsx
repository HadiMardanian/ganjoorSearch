import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Minus,
  Plus,
  Share2,
  Type,
} from 'lucide-react';
import { GANJOOR_SITE } from '@/api/client';
import { fetchPoem } from '@/api/ganjoor';
import { usePoemDetailQuery } from '@/api/queries';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { showToast } from '@/components/ui/Toast';
import {
  readerFontSizeClass,
  readerLineHeightClass,
  useReaderPrefs,
  type ReaderFontSize,
} from '@/hooks/useReaderPrefs';
import type { PoemSummary } from '@/types/ganjoor';
import { linesToCouplets, poemToCouplets, poemToLines } from '@/utils/poemText';
import { saveLastRead } from '@/utils/lastRead';
import { STALE_TIMES } from '@/lib/queryClient';

interface PoemReaderProps {
  poetId: number;
  poemUrl: string;
  poems?: PoemSummary[];
  categoryTitle?: string;
  onBack: () => void;
  onNavigate?: (poemUrl: string) => void;
}

const SWIPE_THRESHOLD = 60;

export function PoemReader({
  poetId,
  poemUrl,
  poems = [],
  categoryTitle,
  onBack,
  onNavigate,
}: PoemReaderProps) {
  const poemQuery = usePoemDetailQuery(poemUrl);
  const queryClient = useQueryClient();
  const { prefs, setFontSize, setLineHeight } = useReaderPrefs();
  const [copied, setCopied] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const couplets = useMemo(() => {
    if (!poemQuery.data) return [];
    const fromVerses = poemToCouplets(poemQuery.data.verses);
    if (fromVerses.length > 0) return fromVerses;
    return linesToCouplets(poemToLines(poemQuery.data));
  }, [poemQuery.data]);

  const currentIndex = poems.findIndex((poem) => poem.fullUrl === poemUrl);
  const prevPoem = currentIndex > 0 ? poems[currentIndex - 1] : null;
  const nextPoem =
    currentIndex >= 0 && currentIndex < poems.length - 1
      ? poems[currentIndex + 1]
      : null;

  const title = poemQuery.data?.title || poemQuery.data?.fullTitle || 'در حال بارگذاری…';
  const displayTitle = poemQuery.data?.fullTitle || title;
  const externalUrl = `${GANJOOR_SITE}${poemUrl}`;
  const plainText = couplets.flatMap((group) => group.lines).join('\n');

  useEffect(() => {
    if (!poemQuery.data) return;
    saveLastRead(poetId, {
      poemUrl,
      poemTitle: poemQuery.data.title || displayTitle,
      categoryTitle,
    });
  }, [categoryTitle, displayTitle, poemQuery.data, poemUrl, poetId]);

  useEffect(() => {
    const neighbors = [prevPoem?.fullUrl, nextPoem?.fullUrl].filter(Boolean) as string[];
    for (const url of neighbors) {
      queryClient.prefetchQuery({
        queryKey: ['poem-detail', url],
        queryFn: ({ signal }) => fetchPoem(url, signal),
        staleTime: STALE_TIMES.poem,
      });
    }
  }, [nextPoem?.fullUrl, prevPoem?.fullUrl, queryClient]);

  async function handleCopy() {
    const text = `${displayTitle}\n\n${plainText}\n\n${externalUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('متن کپی شد.', 'success');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('کپی متن ممکن نشد.', 'error');
    }
  }

  async function handleShare() {
    const text = `${displayTitle}\n\n${plainText}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: displayTitle, text, url: externalUrl });
        return;
      }
      await handleCopy();
    } catch {
      /* user cancelled share */
    }
  }

  function cycleFontSize(direction: 'up' | 'down') {
    const order: ReaderFontSize[] = ['sm', 'md', 'lg'];
    const index = order.indexOf(prefs.fontSize);
    const next =
      direction === 'up'
        ? order[Math.min(index + 1, order.length - 1)]
        : order[Math.max(index - 1, 0)];
    setFontSize(next);
  }

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current == null || !onNavigate) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) < SWIPE_THRESHOLD) return;

    if (delta > 0 && nextPoem?.fullUrl) {
      onNavigate(nextPoem.fullUrl);
    } else if (delta < 0 && prevPoem?.fullUrl) {
      onNavigate(prevPoem.fullUrl);
    }
  }

  return (
    <article
      className="poem-reader-canvas -mx-4 min-h-[calc(100vh-8rem)] px-4 py-2 sm:-mx-6 sm:px-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          className="text-muted hover:text-[var(--color-ink)] inline-flex min-h-[44px] items-center gap-1 text-sm"
          onClick={onBack}
        >
          <ChevronRight size={18} />
          بازگشت
        </button>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            className="h-10 w-10 px-0"
            onClick={() => setShowPrefs((open) => !open)}
            aria-label="تنظیمات خواندن"
          >
            <Type size={18} />
          </Button>
          <Button type="button" variant="ghost" className="h-10 w-10 px-0" onClick={handleShare}>
            <Share2 size={18} />
          </Button>
        </div>
      </div>

      {showPrefs ? (
        <div className="surface-card mb-4 flex flex-wrap items-center gap-3 rounded-2xl border p-3 text-sm">
          <span className="text-muted">اندازه قلم</span>
          <Button type="button" variant="secondary" className="h-9 w-9 px-0" onClick={() => cycleFontSize('down')}>
            <Minus size={16} />
          </Button>
          <span className="min-w-[2rem] text-center font-medium">
            {prefs.fontSize === 'sm' ? 'کوچک' : prefs.fontSize === 'lg' ? 'بزرگ' : 'متوسط'}
          </span>
          <Button type="button" variant="secondary" className="h-9 w-9 px-0" onClick={() => cycleFontSize('up')}>
            <Plus size={16} />
          </Button>
          <button
            type="button"
            className={`rounded-lg border px-3 py-1.5 ${
              prefs.lineHeight === 'relaxed'
                ? 'border-[var(--color-accent)] text-accent'
                : 'border-[var(--color-border)]'
            }`}
            onClick={() =>
              setLineHeight(prefs.lineHeight === 'relaxed' ? 'normal' : 'relaxed')
            }
          >
            فاصله خطوط
          </button>
        </div>
      ) : null}

      {poemQuery.isLoading ? (
        <div className="space-y-4 py-8">
          <Skeleton className="mx-auto h-8 w-2/3" />
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="mx-auto h-5 w-full max-w-md" />
          ))}
        </div>
      ) : poemQuery.error ? (
        <p className="text-muted py-12 text-center text-sm">خطا در بارگذاری شعر.</p>
      ) : (
        <>
          <header className="mb-8 text-center">
            <h2 className="text-lg font-bold leading-relaxed sm:text-xl">{displayTitle}</h2>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button variant="secondary" onClick={handleCopy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'کپی شد' : 'کپی'}
              </Button>
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
              >
                <ExternalLink size={16} />
                گنجور
              </a>
            </div>
          </header>

          <div
            className={`poem-reader mx-auto max-w-prose space-y-6 ${readerFontSizeClass[prefs.fontSize]}`}
          >
            {couplets.map((group) => (
              <div
                key={`couplet-${group.coupletIndex}`}
                className={`verse-couplet space-y-1 ${readerLineHeightClass[prefs.lineHeight]}`}
              >
                {group.lines.map((line, index) => (
                  <p
                    key={`${poemUrl}-${group.coupletIndex}-${index}`}
                    className="verse-text text-center"
                  >
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>

          {(prevPoem || nextPoem) && onNavigate ? (
            <div className="mt-10 grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-6">
              {prevPoem?.fullUrl ? (
                <Button
                  variant="secondary"
                  className="min-h-[48px] justify-start text-xs sm:text-sm"
                  onClick={() => onNavigate(prevPoem.fullUrl!)}
                >
                  <ChevronRight size={16} />
                  <span className="truncate">{prevPoem.title}</span>
                </Button>
              ) : (
                <span />
              )}
              {nextPoem?.fullUrl ? (
                <Button
                  variant="secondary"
                  className="min-h-[48px] justify-end text-xs sm:text-sm"
                  onClick={() => onNavigate(nextPoem.fullUrl!)}
                >
                  <span className="truncate">{nextPoem.title}</span>
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
