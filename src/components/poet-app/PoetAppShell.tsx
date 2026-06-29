import type { ReactNode } from 'react';
import type { PoetAppTab } from '@/hooks/useSearchParams';
import { PoetAppBottomNav } from '@/components/poet-app/PoetAppBottomNav';
import type { PoetAppScreen } from '@/components/poet-app/PoetAppHeader';
import { PoetAppHeader } from '@/components/poet-app/PoetAppHeader';
import type { Theme } from '@/hooks/useTheme';
import type { Poet } from '@/types/ganjoor';

interface PoetAppShellProps {
  poet: Poet;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  activeTab: PoetAppTab;
  onTabChange: (tab: PoetAppTab) => void;
  screen: PoetAppScreen;
  headerTitle?: string;
  onChangePoet: () => void;
  children: ReactNode;
  hideBottomNav?: boolean;
}

export function PoetAppShell({
  poet,
  theme,
  onThemeChange,
  activeTab,
  onTabChange,
  screen,
  headerTitle,
  onChangePoet,
  children,
  hideBottomNav = false,
}: PoetAppShellProps) {
  return (
    <div className="poet-app-shell flex min-h-screen flex-col">
      <PoetAppHeader
        poet={poet}
        theme={theme}
        onThemeChange={onThemeChange}
        screen={screen}
        title={headerTitle}
        onChangePoet={onChangePoet}
      />
      <main
        id="main-content"
        className={`poet-app-main mx-auto w-full max-w-5xl flex-1 px-4 py-4 sm:px-6 sm:py-6 ${
          hideBottomNav ? 'pb-safe' : 'pb-safe-nav'
        }`}
      >
        {children}
      </main>
      {!hideBottomNav ? (
        <PoetAppBottomNav activeTab={activeTab} onChange={onTabChange} />
      ) : null}
    </div>
  );
}
