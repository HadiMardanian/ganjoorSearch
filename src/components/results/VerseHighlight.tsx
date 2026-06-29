import { highlightText } from '@/utils/highlight';
import type { Verse } from '@/types/ganjoor';

interface VerseHighlightProps {
  verses: Verse[];
  searchTerm: string;
}

export function VerseHighlight({ verses, searchTerm }: VerseHighlightProps) {
  return (
    <div className="space-y-2">
      {verses.map((verse) => (
        <p
          key={verse.id}
          className="verse-text text-base text-stone-800"
          dangerouslySetInnerHTML={{
            __html: highlightText(verse.text || '', searchTerm),
          }}
        />
      ))}
    </div>
  );
}
