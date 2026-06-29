import { useEffect, useRef } from 'react';

interface UsePoetAppBackStackOptions {
  enabled: boolean;
  atRoot: boolean;
}

/**
 * Seeds a history guard at poet-app root so the first hardware Back
 * does not immediately exit the installed PWA.
 */
export function usePoetAppBackStack({ enabled, atRoot }: UsePoetAppBackStackOptions) {
  const guardPushedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      guardPushedRef.current = false;
      return;
    }

    if (!atRoot || guardPushedRef.current) return;

    window.history.pushState({ poetAppGuard: true }, '', window.location.href);
    guardPushedRef.current = true;
  }, [enabled, atRoot]);

  useEffect(() => {
    if (!enabled) return;

    function handlePopState() {
      if (atRoot && guardPushedRef.current) {
        guardPushedRef.current = false;
        return;
      }
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [enabled, atRoot]);
}
