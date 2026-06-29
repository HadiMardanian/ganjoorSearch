import { useRef, useState } from 'react';
import { Download, FileSpreadsheet, X } from 'lucide-react';
import { fetchAllSearchResults } from '@/api/ganjoor';
import { exportResults, type ExportFormat } from '@/utils/export';
import { formatPersianNumber } from '@/utils/paging';
import { showToast } from '@/components/ui/Toast';
import type { CategoryFilter, PoetFilter, ViewMode } from '@/types/ganjoor';
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
  totalCount?: number;
  disabled?: boolean;
}

export function ExportButtons({
  term,
  poetId,
  categoryId,
  totalCount = 0,
  disabled,
}: ExportButtonsProps) {
  const [activeExport, setActiveExport] = useState<ExportAction | null>(null);
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  function cancelExport() {
    abortRef.current?.abort();
  }

  async function handleExport(action: ExportAction) {
    if (!term.trim()) {
      showToast('ابتدا یک جستجو انجام دهید.', 'info');
      return;
    }

    if (totalCount > EXPORT_WARN_THRESHOLD) {
      const confirmed = window.confirm(
        `این جستجو ${formatPersianNumber(totalCount)} قطعه دارد. دریافت و export ممکن است چند دقیقه طول بکشد. ادامه می‌دهید؟`,
      );
      if (!confirmed) return;
    }

    const { mode, format } = EXPORT_BUTTONS.find((button) => button.id === action)!;
    const controller = new AbortController();
    abortRef.current = controller;
    setActiveExport(action);
    setProgress(null);

    try {
      const results = await fetchAllSearchResults(term, {
        poetId,
        categoryId,
        signal: controller.signal,
        onProgress: (loaded, total) => {
          setProgress({ loaded, total });
        },
      });

      if (controller.signal.aborted) return;

      if (totalCount > 0 && results.length < totalCount) {
        showToast(
          `${formatPersianNumber(results.length)} از ${formatPersianNumber(totalCount)} قطعه دریافت شد.`,
          'info',
        );
      }

      const { success, rowCount } = exportResults(results, mode, format);

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

  const isBusy = activeExport !== null;

  return (
    <div className="flex flex-col items-center gap-3">
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
        <div className="flex items-center gap-3 text-sm text-stone-600">
          <span>در حال تهیه {EXPORT_LABELS[activeExport]}…</span>
          {progress && progress.total > 1 ? (
            <span>
              صفحه {formatPersianNumber(progress.loaded)} از{' '}
              {formatPersianNumber(progress.total)}
            </span>
          ) : (
            <span>در حال دریافت نتایج…</span>
          )}
          <Button variant="secondary" onClick={cancelExport}>
            <X size={16} />
            لغو
          </Button>
        </div>
      )}
    </div>
  );
}
