type ObserverOptions = {
  root?: HTMLElement | null;
  rootMargin?: string;
  threshold?: number | number[];
};

const defaultOptions: ObserverOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0,
};

let observer: IntersectionObserver | null = null;
let activeCount = 0;
let totalTargets = 0;

function handleIntersection(entries: IntersectionObserverEntry[]): void {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const target = entry.target as HTMLElement;
      target.setAttribute('data-inview', 'true');
      observer?.unobserve(target);
      activeCount++;

      if (activeCount === totalTargets) {
        cleanup();
      }
    }
  });
}

function cleanup(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  activeCount = 0;
}

export function initializeScrollInview(options: ObserverOptions = {}) {
  // 既存のObserverをクリーンアップ
  cleanup();

  const targetElements = document.querySelectorAll<HTMLElement>('[data-inview-animation]');
  totalTargets = targetElements.length;

  if (totalTargets === 0) return;

  const mergedOptions = { ...defaultOptions, ...options };

  observer = new IntersectionObserver(handleIntersection, mergedOptions);
  targetElements.forEach((target) => observer?.observe(target));
}

export function cleanupScrollInview(): void {
  cleanup();
}
