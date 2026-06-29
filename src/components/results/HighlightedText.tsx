import { useLayoutEffect, useMemo, useRef, useId } from 'react';
import {
  clearHighlightRanges,
  createTextRanges,
  highlightTextHtml,
  setHighlightRanges,
  supportsCssHighlightApi,
} from '@/utils/highlight';

interface HighlightedTextProps {
  text: string;
  term: string;
  className?: string;
}

export function HighlightedText({ text, term, className = '' }: HighlightedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const ownerId = useId();
  const owner = useMemo(() => Symbol(ownerId), [ownerId]);
  const useHighlightApi = supportsCssHighlightApi();

  useLayoutEffect(() => {
    if (!useHighlightApi || !ref.current || !term.trim()) return;

    const textNode = ref.current.firstChild;
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

    const ranges = createTextRanges(textNode as Text, text, term);
    setHighlightRanges(owner, ranges);

    return () => {
      clearHighlightRanges(owner);
    };
  }, [text, term, owner, useHighlightApi]);

  if (!useHighlightApi) {
    return (
      <span
        className={className}
        dangerouslySetInnerHTML={{ __html: highlightTextHtml(text, term) }}
      />
    );
  }

  return (
    <span ref={ref} className={`poetry-highlight-host ${className}`}>
      {text}
    </span>
  );
}
