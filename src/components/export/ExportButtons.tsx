import { Download } from 'lucide-react';
import { searchPoems } from '@/api/ganjoor';
import { exportResults } from '@/utils/export';
import { showToast } from '@/components/ui/Toast';
import type { CategoryFilter, PoetFilter, ViewMode } from '@/types/ganjoor';
import { Button } from '@/components/ui/Button';

interface ExportButtonsProps {
  term: string;
  poetId: PoetFilter;
  categoryId: CategoryFilter;
  disabled?: boolean;
}

export function ExportButtons({
  term,
  poetId,
  categoryId,
  disabled,
}: ExportButtonsProps) {
  async function handleExport(mode: ViewMode) {
    if (!term.trim()) {
      showToast('ابتدا یک جستجو انجام دهید.', 'info');
      return;
    }

    try {
      const response = await searchPoems(term, {
        poetId,
        categoryId,
        page: 1,
        pageSize: 200,
      });

      const success = exportResults(response.results, mode);

      if (!success) {
        showToast('نتیجه‌ای برای خروجی وجود ندارد.', 'info');
        return;
      }

      showToast('فایل CSV با موفقیت دانلود شد.', 'success');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'خطا در تهیه فایل خروجی';
      showToast(message, 'error');
    }
  }

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button
        variant="secondary"
        disabled={disabled}
        onClick={() => handleExport('verse')}
      >
        <Download size={16} />
        خروجی CSV — نمایش بیت
      </Button>
      <Button
        variant="secondary"
        disabled={disabled}
        onClick={() => handleExport('full')}
      >
        <Download size={16} />
        خروجی CSV — غزل کامل
      </Button>
    </div>
  );
}
