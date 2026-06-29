import { HighlightedText } from './HighlightedText';
import type { Verse } from '@/types/ganjoor';

interface VerseHighlightProps {
  verses: Verse[];
  searchTerm: string;
}

export function VerseHighlight({ verses, searchTerm }: VerseHighlightProps) {
  return (
    <div className="space-y-2">
      {verses.map((verse) => (
        <HighlightedText
          key={verse.id}
          text={verse.text || ''}
          term={searchTerm}
          className="verse-text text-base text-stone-800 dark:text-stone-100"
        />
      ))}
    </div>
  );
}
