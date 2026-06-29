import { useRef, useState } from 'react';
import { Download, FileSpreadsheet, X } from 'lucide-react';
import { fetchAllSearchResults } from '@/api/ganjoor';
import { exportResults, type ExportFormat } from '@/utils/export';
import { formatPersianNumber } from '@/utils/paging';
import { showToast } from '@/components/ui/Toast';
import type { CategoryFilter, PoetFilter, ViewMode } from '@/types/ganjoor';
import { Button } from '@/components/ui/Button';

const EXPORT_WARN_THRESHOLD = 5000;

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
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  function cancelExport() {
    abortRef.current?.abort();
  }

  async function handleExport(mode: ViewMode, format: ExportFormat) {
    if (!term.trim()) {
      showToast('ابتدا یک جستجو انجام کنید.', 'info');
      return;
    }

    if (totalCount > EXPORT_WARN_THRESHOLD) {
      const confirmed = window.confirm(
        `این جستجو ${formatPersianNumber(totalCount)} غزل دارد. دریافت و export ممکن است چند دقیقه طول بکشد. ادامه می‌دهید؟`,
      );
      if (!confirmed) return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setExporting(true);
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
          `${formatPersianNumber(results.length)} از ${formatPersianNumber(totalCount)} غزل دریافت شد.`,
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
          : `${formatPersianNumber(results.length)} غزل`;
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
      setExporting(false);
      setProgress(null);
    }
  }

  const isDisabled = disabled || exporting || !term.trim();

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          variant="secondary"
          disabled={isDisabled}
          onClick={() => handleExport('verse', 'csv')}
        >
          <Download size={16} />
          {exporting ? 'در حال آماده‌سازی…' : 'CSV — بیت'}
        </Button>
        <Button
          variant="secondary"
          disabled={isDisabled}
          onClick={() => handleExport('full', 'csv')}
        >
          <Download size={16} />
          {exporting ? 'در حال آماده‌سازی…' : 'CSV — غزل کامل'}
        </Button>
        <Button
          variant="secondary"
          disabled={isDisabled}
          onClick={() => handleExport('verse', 'excel')}
        >
          <FileSpreadsheet size={16} />
          {exporting ? 'در حال آماده‌سازی…' : 'Excel — بیت'}
        </Button>
        <Button
          variant="secondary"
          disabled={isDisabled}
          onClick={() => handleExport('full', 'excel')}
        >
          <FileSpreadsheet size={16} />
          {exporting ? 'در حال آماده‌سازی…' : 'Excel — غزل کامل'}
        </Button>
      </div>

      {exporting && (
        <div className="flex items-center gap-3 text-sm text-stone-600">
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
