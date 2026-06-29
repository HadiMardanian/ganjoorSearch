import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface QueryErrorPanelProps {
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
}

export function QueryErrorPanel({
  message = 'خطا در بارگذاری.',
  onRetry,
  retrying = false,
}: QueryErrorPanelProps) {
  return (
    <div className="py-12 text-center">
      <p className="text-muted mb-4 text-sm">{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry} disabled={retrying}>
          <RefreshCw size={16} className={retrying ? 'animate-spin' : ''} />
          {retrying ? 'در حال تلاش…' : 'تلاش دوباره'}
        </Button>
      ) : null}
    </div>
  );
}
