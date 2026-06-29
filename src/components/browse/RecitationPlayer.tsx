import { useRef, useState } from 'react';
import { Pause, Play, Volume2 } from 'lucide-react';
import type { PoemRecitation } from '@/types/ganjoor';
import { Button } from '@/components/ui/Button';

interface RecitationPlayerProps {
  recitations: PoemRecitation[];
}

export function RecitationPlayer({ recitations }: RecitationPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  if (recitations.length === 0) return null;

  const active = recitations[activeIndex]!;

  function selectRecitation(index: number) {
    setActiveIndex(index);
    setPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
  }

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  return (
    <div className="surface-card mb-4 rounded-2xl border p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <Volume2 size={16} />
        خوانش
      </div>
      {recitations.length > 1 ? (
        <select
          className="field-control mb-3 w-full px-3 py-2 text-sm"
          value={activeIndex}
          onChange={(event) => selectRecitation(Number(event.target.value))}
        >
          {recitations.map((item, index) => (
            <option key={item.id} value={index}>
              {item.audioArtist || 'خوانشگر'} — {item.audioTitle || `خوانش ${index + 1}`}
            </option>
          ))}
        </select>
      ) : (
        <p className="text-muted mb-3 text-xs">
          {active.audioArtist || 'خوانشگر'}
          {active.audioTitle ? ` — ${active.audioTitle}` : ''}
        </p>
      )}
      <audio
        ref={audioRef}
        src={active.mp3Url}
        preload="none"
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />
      <Button type="button" variant="secondary" onClick={togglePlay}>
        {playing ? <Pause size={16} /> : <Play size={16} />}
        {playing ? 'توقف' : 'پخش'}
      </Button>
    </div>
  );
}
