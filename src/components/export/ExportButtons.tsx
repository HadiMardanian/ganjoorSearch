import { useRef, useState } from 'react';
import { Download, FileSpreadsheet, X } from 'lucide-react';
import { fetchAllSearchResults, type ExportProgress, type ExportScope } from '@/api/ganjoor';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { exportResults, buildExportFilename, type ExportFormat } from '@/utils/export';
import { enrichResultsWithFullText } from '@/utils/enrichResults';
import { formatPersianNumber } from '@/utils/paging';
import { showToast } from '@/components/ui/Toast';
import type { CategoryFilter, GroupedResult, PoetFilter, ViewMode } from '@/types/ganjoor';
import { Button } from '@/components/ui/Button';

const EXPORT_WARN_THRESHOLD = 5000;

type ExportAction = 'verse-csv' | 'full-csv' | 'verse-excel' | 'full-excel';

const EXPORT_BUTTONS: Array<{
  id: ExportAction;
  mode: ViewMode;
  format: ExportFormat;
  label: string;
  icon: 'download' | 'spreadsheet';
}> = [
  { id: 'verse-csv', mode: 'verse', format: 'csv', label: 'CSV — بیت', icon: 'download' },
  { id: 'full-csv', mode: 'full', format: 'csv', label: 'CSV — متن کامل', icon: 'download' },
  { id: 'verse-excel', mode: 'verse', format: 'excel', label: 'Excel — بیت', icon: 'spreadsheet' },
  { id: 'full-excel', mode: 'full', format: 'excel', label: 'Excel — متن کامل', icon: 'spreadsheet' },
];

const EXPORT_LABELS: Record<ExportAction, string> = {
  'verse-csv': 'CSV — بیت',
  'full-csv': 'CSV — متن کامل',
  'verse-excel': 'Excel — بیت',
  'full-excel': 'Excel — متن کامل',
};

interface ExportButtonsProps {
  term: string;
  poetId: PoetFilter;
  categoryId: CategoryFilter;
  currentPageResults?: GroupedResult[];
  totalCount?: number;
  disabled?: boolean;
}

export function ExportButtons({
  term,
  poetId,
  categoryId,
  currentPageResults = [],
  totalCount = 0,
  disabled,
}: ExportButtonsProps) {
  const [activeExport, setActiveExport] = useState<ExportAction | null>(null);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [scope, setScope] = useState<ExportScope>('all');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pendingAction = useRef<ExportAction | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  function cancelExport() {
    abortRef.current?.abort();
  }

  async function runExport(action: ExportAction) {
    const { mode, format } = EXPORT_BUTTONS.find((button) => button.id === action)!;
    const controller = new AbortController();
    abortRef.current = controller;
    setActiveExport(action);
    setProgress(null);

    try {
      let results: GroupedResult[];

      if (scope === 'page') {
        results = currentPageResults;
        setProgress({
          phase: 'fetching',
          loadedPages: 1,
          totalPages: 1,
          loadedItems: results.length,
          totalItems: results.length,
        });
      } else {
        results = await fetchAllSearchResults(term, {
          poetId,
          categoryId,
          scope: 'all',
          signal: controller.signal,
          onProgress: setProgress,
        });
      }

      if (controller.signal.aborted) return;

      if (scope === 'all' && totalCount > 0 && results.length < totalCount) {
        showToast(
          `${formatPersianNumber(results.length)} از ${formatPersianNumber(totalCount)} قطعه دریافت شد.`,
          'info',
        );
      }

      if (mode === 'full') {
        results = await enrichResultsWithFullText(results, {
          signal: controller.signal,
          onProgress: (loaded, total) => {
            setProgress({
              phase: 'enriching',
              loadedPages: 1,
              totalPages: 1,
              loadedItems: loaded,
              totalItems: total,
            });
          },
        });
      }

      if (controller.signal.aborted) return;

      const filename = buildExportFilename(term, mode, format);
      const { success, rowCount } = exportResults(results, mode, format, filename);

      if (!success) {
        showToast('نتیجه‌ای برای خروجی وجود ندارد.', 'info');
        return;
      }

      const label = format === 'excel' ? 'Excel' : 'CSV';
      const countLabel =
        mode === 'verse'
          ? `${formatPersianNumber(rowCount)} ردیف بیت`
          : `${formatPersianNumber(results.length)} قطعه`;
      showToast(`فایل ${label} با ${countLabel} دانلود شد.`, 'success');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        showToast('دریافت خروجی لغو شد.', 'info');
        return;
      }
      const message =
        error instanceof Error ? error.message : 'خطا در تهیه فایل خروجی';
      showToast(message, 'error');
    } finally {
      abortRef.current = null;
      setActiveExport(null);
      setProgress(null);
    }
  }

  function handleExport(action: ExportAction) {
    if (!term.trim()) {
      showToast('ابتدا یک جستجو انجام دهید.', 'info');
      return;
    }

    if (scope === 'page' && currentPageResults.length === 0) {
      showToast('صفحهٔ فعلی نتیجه‌ای ندارد.', 'info');
      return;
    }

    const exportCount = scope === 'page' ? currentPageResults.length : totalCount;

    if (exportCount > EXPORT_WARN_THRESHOLD) {
      pendingAction.current = action;
      setConfirmOpen(true);
      return;
    }

    void runExport(action);
  }

  function handleConfirmLargeExport() {
    const action = pendingAction.current;
    setConfirmOpen(false);
    pendingAction.current = null;
    if (action) void runExport(action);
  }

  const isBusy = activeExport !== null;

  function formatProgressText(current: ExportProgress): string {
    if (current.phase === 'enriching') {
      return `${formatPersianNumber(current.loadedItems)} از ${formatPersianNumber(current.totalItems)} قطعه — دریافت متن کامل`;
    }
    if (current.totalPages > 1) {
      return `صفحه ${formatPersianNumber(current.loadedPages)} از ${formatPersianNumber(current.totalPages)} — ${formatPersianNumber(current.loadedItems)} از ${formatPersianNumber(current.totalItems)} قطعه`;
    }
    return `${formatPersianNumber(current.loadedItems)} قطعه`;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="flex flex-wrap items-center justify-center gap-2 text-sm"
        role="group"
        aria-label="محدودهٔ export"
      >
        <span className="text-stone-600">خروجی:</span>
        <button
          type="button"
          className={`rounded-full px-3 py-1 ${scope === 'all' ? 'bg-[#9a3412] text-white' : 'border border-stone-300 text-stone-700'}`}
          onClick={() => setScope('all')}
          disabled={isBusy}
          aria-pressed={scope === 'all'}
        >
          همهٔ نتایج
        </button>
        <button
          type="button"
          className={`rounded-full px-3 py-1 ${scope === 'page' ? 'bg-[#9a3412] text-white' : 'border border-stone-300 text-stone-700'}`}
          onClick={() => setScope('page')}
          disabled={isBusy}
          aria-pressed={scope === 'page'}
        >
          فقط این صفحه
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {EXPORT_BUTTONS.map((button) => {
          const isActive = activeExport === button.id;
          const Icon = button.icon === 'spreadsheet' ? FileSpreadsheet : Download;

          return (
            <Button
              key={button.id}
              variant="secondary"
              disabled={disabled || (isBusy && !isActive) || !term.trim()}
              onClick={() => handleExport(button.id)}
            >
              <Icon size={16} />
              {isActive ? 'در حال آماده‌سازی…' : button.label}
            </Button>
          );
        })}
      </div>

      {activeExport && (
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-stone-600">
          <span>در حال تهیه {EXPORT_LABELS[activeExport]}…</span>
          {progress ? <span>{formatProgressText(progress)}</span> : <span>در حال دریافت نتایج…</span>}
          <Button variant="secondary" onClick={cancelExport}>
            <X size={16} />
            لغو
          </Button>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="export حجم بالا"
        message={`این جستجو ${formatPersianNumber(scope === 'page' ? currentPageResults.length : totalCount)} قطعه دارد. دریافت و export ممکن است چند دقیقه طول بکشد. ادامه می‌دهید؟`}
        confirmLabel="ادامه"
        cancelLabel="انصراف"
        onConfirm={handleConfirmLargeExport}
        onCancel={() => {
          setConfirmOpen(false);
          pendingAction.current = null;
        }}
      />
    </div>
  );
}
