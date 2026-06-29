import { describe, expect, it } from 'vitest';
import { buildPoemDeepLink } from './deepLink';

describe('deepLink', () => {
  it('builds poem deep link with poet PWA path', () => {
    const link = buildPoemDeepLink(1, '/hafez/ghazal/1', {
      source: 'pwa',
      tab: 'browse',
    }, 'https://example.com/ganjoorSearch/');

    expect(link).toContain('/pwa/1');
    expect(link).toContain('poem=%2Fhafez%2Fghazal%2F1');
    expect(link).toContain('source=pwa');
    expect(link).toContain('tab=browse');
  });
});
