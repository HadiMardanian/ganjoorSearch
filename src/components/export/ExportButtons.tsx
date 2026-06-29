import { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { fetchAllSearchResults } from '@/api/ganjoor';
import { exportResults, type ExportFormat } from '@/utils/export';
import { showToast } from '@/components/ui/Toast';
import type { CategoryFilter, PoetFilter, ViewMode } from '@/types/ganjoor';
import { Button } from '@/components/ui/Button';

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

  async function handleExport(mode: ViewMode, format: ExportFormat) {
    if (!term.trim()) {
      showToast('ابتدا یک جستجو انجام دهید.', 'info');
      return;
    }

    setExporting(true);

    try {
      const results = await fetchAllSearchResults(term, {
        poetId,
        categoryId,
        onProgress: (loaded, total) => {
          if (total > 1 && loaded === 1) {
            showToast(`در حال دریافت ${total} صفحه نتیجه…`, 'info');
          }
        },
      });

      if (totalCount > 0 && results.length < totalCount) {
        showToast(
          `${results.length} از ${totalCount} نتیجه دریافت شد.`,
          'info',
        );
      }

      const success = exportResults(results, mode, format);

      if (!success) {
        showToast('نتیجه‌ای برای خروجی وجود ندارد.', 'info');
        return;
      }

      const label = format === 'excel' ? 'Excel' : 'CSV';
      showToast(`فایل ${label} با ${results.length} قطعه دانلود شد.`, 'success');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'خطا در تهیه فایل خروجی';
      showToast(message, 'error');
    } finally {
      setExporting(false);
    }
  }

  const isDisabled = disabled || exporting || !term.trim();

  return (
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
  );
}
