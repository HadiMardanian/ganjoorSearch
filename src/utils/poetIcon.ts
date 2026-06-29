import { buildPoetImageUrl } from '@/api/client';

const BASE = import.meta.env.BASE_URL;

export type PoetIconSize = 192 | 512;

export function getPrebuiltPoetIconUrl(poetId: number, size: PoetIconSize = 192): string {
  return `${BASE}icons/poets/${poetId}-${size}.png`;
}

export function getPoetInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '؟';
  return trimmed.charAt(0);
}

export async function generatePoetIconBlob(
  poetName: string,
  imageUrl?: string,
  size: PoetIconSize = 192,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const bg = '#9a3412';
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  if (imageUrl) {
    try {
      const img = await loadImage(imageUrl);
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      ctx.restore();
    } catch {
      drawInitial(ctx, poetName, size);
    }
  } else {
    drawInitial(ctx, poetName, size);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create icon blob'));
    }, 'image/png');
  });
}

function drawInitial(ctx: CanvasRenderingContext2D, poetName: string, size: number) {
  ctx.fillStyle = '#fff7ed';
  ctx.font = `bold ${Math.round(size * 0.45)}px Vazirmatn, Tahoma, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(getPoetInitial(poetName), size / 2, size / 2 + size * 0.02);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = src;
  });
}

export async function resolvePoetIconUrl(
  poetId: number,
  poetName: string,
  imagePath?: string,
  size: PoetIconSize = 192,
): Promise<string> {
  const prebuilt = getPrebuiltPoetIconUrl(poetId, size);
  const exists = await checkImageExists(prebuilt);
  if (exists) return prebuilt;

  const remote = buildPoetImageUrl(imagePath);
  const blob = await generatePoetIconBlob(poetName, remote, size);
  return URL.createObjectURL(blob);
}

export function getManifestIconUrls(poetId: number): { icon192: string; icon512: string } {
  return {
    icon192: getPrebuiltPoetIconUrl(poetId, 192),
    icon512: getPrebuiltPoetIconUrl(poetId, 512),
  };
}

function checkImageExists(url: string, timeoutMs = 2500): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = window.setTimeout(() => resolve(false), timeoutMs);
    img.onload = () => {
      window.clearTimeout(timer);
      resolve(true);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(false);
    };
    img.src = url;
  });
}

export async function resolveManifestIconUrls(
  poetId: number,
): Promise<{ icon192: string; icon512: string }> {
  const prebuilt = getManifestIconUrls(poetId);
  const hasPrebuilt = await checkImageExists(prebuilt.icon192);
  if (hasPrebuilt) return prebuilt;

  const fallback = `${BASE}icon.svg`;
  return { icon192: fallback, icon512: fallback };
}
