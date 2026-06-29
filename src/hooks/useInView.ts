import { useEffect, useRef, useState, type RefObject } from 'react';

export function useInView<T extends HTMLElement>(rootMargin = '200px'): {
  ref: RefObject<T | null>;
  inView: boolean;
} {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
        }
      },
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}
