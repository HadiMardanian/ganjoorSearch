import { useState } from 'react';
import { buildPoetImageUrl } from '@/api/client';
import type { Poet } from '@/types/ganjoor';
import { getPoetInitial } from '@/utils/poetIcon';

interface PoetAvatarProps {
  poet: Pick<Poet, 'name' | 'fullName' | 'imageUrl'>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-14 w-14 text-base',
  lg: 'h-24 w-24 text-2xl',
  xl: 'h-32 w-32 text-4xl',
};

export function PoetAvatar({ poet, size = 'md', className = '' }: PoetAvatarProps) {
  const [failed, setFailed] = useState(false);
  const name = poet.name || poet.fullName || 'شاعر';
  const imageUrl = buildPoetImageUrl(poet.imageUrl);
  const showImage = imageUrl && !failed;

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-accent)] font-bold text-white ${sizeClasses[size]} ${className}`}
      aria-hidden
    >
      {showImage ? (
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{getPoetInitial(name)}</span>
      )}
    </div>
  );
}
