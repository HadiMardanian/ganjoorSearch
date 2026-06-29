interface BreadcrumbSegment {
  id: number | null;
  title: string;
}

interface BrowseBreadcrumbProps {
  segments: BreadcrumbSegment[];
  onNavigate: (pathIndex: number | null) => void;
}

export function BrowseBreadcrumb({ segments, onNavigate }: BrowseBreadcrumbProps) {
  if (segments.length <= 1) return null;

  return (
    <nav
      className="text-muted mb-4 flex flex-wrap items-center gap-1 text-xs sm:text-sm"
      aria-label="مسیر مرور"
    >
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        return (
          <span key={`${segment.id ?? 'root'}-${index}`} className="inline-flex items-center gap-1">
            {index > 0 ? <span className="text-subtle">›</span> : null}
            {isLast ? (
              <span className="text-[var(--color-ink)] font-medium">{segment.title}</span>
            ) : (
              <button
                type="button"
                className="hover:text-accent transition-colors"
                onClick={() => onNavigate(segment.id == null ? null : index)}
              >
                {segment.title}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
