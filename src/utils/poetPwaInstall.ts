import { getPoetManifestUrl } from '@/utils/poetManifest';
import { getPoetPwaManifestId } from '@/utils/poetPwaPath';

interface InstalledRelatedWebApp {
  id?: string;
  platform: string;
  url?: string;
}

export async function isPoetPwaInstalled(poetId: number): Promise<boolean> {
  const getInstalled = (
    navigator as Navigator & {
      getInstalledRelatedApps?: () => Promise<InstalledRelatedWebApp[]>;
    }
  ).getInstalledRelatedApps;

  if (typeof getInstalled !== 'function') {
    return false;
  }

  try {
    const apps = await getInstalled();
    const manifestId = getPoetPwaManifestId(poetId);
    return apps.some(
      (app) =>
        app.platform === 'webapp' &&
        (app.id === manifestId || app.url?.includes(`poet-${poetId}.webmanifest`)),
    );
  } catch {
    return false;
  }
}

export function poetRelatedApplicationEntry(poetId: number) {
  return {
    platform: 'webapp' as const,
    url: getPoetManifestUrl(poetId),
    id: getPoetPwaManifestId(poetId),
  };
}
