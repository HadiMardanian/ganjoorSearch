import { isPoetRecordedAsInstalled } from '@/utils/installedPoets';
import { getPoetManifestUrl } from '@/utils/poetManifest';
import { getPoetPwaManifestId } from '@/utils/poetPwaPath';

interface InstalledRelatedWebApp {
  id?: string;
  platform: string;
  url?: string;
}

function normalizeManifestId(id: string): string {
  return id.replace(/\/$/, '');
}

function matchesPoetManifest(app: InstalledRelatedWebApp, poetId: number): boolean {
  const manifestId = normalizeManifestId(getPoetPwaManifestId(poetId));
  if (app.id && normalizeManifestId(app.id) === manifestId) return true;
  const expectedUrl = getPoetManifestUrl(poetId);
  if (app.url && (app.url === expectedUrl || app.url.endsWith(`poet-${poetId}.webmanifest`))) {
    return true;
  }
  return false;
}

export async function isPoetPwaInstalled(poetId: number): Promise<boolean> {
  if (isPoetRecordedAsInstalled(poetId)) return true;

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
    return apps.some(
      (app) => app.platform === 'webapp' && matchesPoetManifest(app, poetId),
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
