import { describe, expect, it } from 'vitest';
import { formatDisplayTitle } from './displayTitle';

describe('formatDisplayTitle', () => {
  it('removes category from three-part breadcrumb', () => {
    expect(formatDisplayTitle('رودکی » رباعیات » رباعی شمارهٔ ۱۰')).toBe(
      'رودکی » رباعی شمارهٔ ۱۰',
    );
  });

  it('keeps two-part title unchanged', () => {
    expect(formatDisplayTitle('حافظ » غزل شمارهٔ ۱')).toBe('حافظ » غزل شمارهٔ ۱');
  });
});
