const SCROLL_THRESHOLD = 200;

let observer: IntersectionObserver | null = null;
let sentinel: HTMLElement | null = null;

function cleanup() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (sentinel && sentinel.parentElement) {
    sentinel.remove();
    sentinel = null;
  }
}

export function initializeScrollEvent() {
  cleanup();

  // 監視対象となる要素を作成
  sentinel = document.createElement('div');
  sentinel.style.position = 'absolute';
  sentinel.style.top = `${SCROLL_THRESHOLD}px`;
  sentinel.style.height = '1px';
  sentinel.style.width = '1px';
  sentinel.style.pointerEvents = 'none';
  sentinel.style.opacity = '0';

  // アクセシビリティ対応
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.setAttribute('role', 'presentation');

  document.body.appendChild(sentinel);

  // Intersection Observerの設定
  observer = new IntersectionObserver(
    ([entry]) => {
      document.documentElement.classList.toggle('scrolled', !entry.isIntersecting);
    },
    { threshold: 1.0 }
  );

  // 監視開始
  observer.observe(sentinel);
}

export function cleanupScrollEvent() {
  cleanup();
}
