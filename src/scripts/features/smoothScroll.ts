let clickHandler: ((event: MouseEvent) => void) | null = null;

function getHeaderBlockSize(): string {
  const header = document.querySelector<HTMLElement>('[data-fixed-header]');
  if (!header) return '0';

  const { position, blockSize } = window.getComputedStyle(header);
  return position === 'fixed' || position === 'sticky' ? blockSize : '0';
}

function scrollToTarget(element: HTMLElement): void {
  // 固定配置のヘッダーのブロックサイズを`scrollMarginBlockStart`に設定
  element.style.scrollMarginBlockStart = getHeaderBlockSize();
  // ユーザーが視差効果を減らす設定をしているかどうかを判定
  const isPrefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 視差効果を減らす設定がされている場合は 'instant'、そうでない場合は 'smooth' にスクロール動作を設定
  const scrollBehavior: ScrollBehavior = isPrefersReduced ? 'instant' : 'smooth';
  // 縦書きの場合は左スクロール、横書きの場合は上スクロールを実行
  element.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
}

function focusTarget(element: HTMLElement): void {
  // ターゲット要素にフォーカスを設定
  element.focus({ preventScroll: true });
  // アクティブな要素がターゲット要素でない場合
  if (document.activeElement !== element) {
    const previousTabIndex = element.getAttribute('tabindex');
    // ターゲット要素のtabindexを一時的に-1に設定
    element.setAttribute('tabindex', '-1');
    // 再度フォーカスを設定
    element.focus({ preventScroll: true });

    // 元のtabindexを復元
    if (previousTabIndex !== null) {
      element.setAttribute('tabindex', previousTabIndex);
    } else {
      element.removeAttribute('tabindex');
    }
  }
}

function shouldSkipSmoothScroll(link: HTMLAnchorElement, hash: string): boolean {
  return (
    !hash ||
    link.getAttribute('role') === 'tab' ||
    link.getAttribute('role') === 'button' ||
    link.getAttribute('data-smooth-scroll') === 'disabled'
  );
}

function handleClick(event: MouseEvent): void {
  // クリックされたボタンが左ボタンでない場合は処理を中断
  if (event.button !== 0) return;
  // クリックされたリンク要素を取得
  const currentLink = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="#"]');
  if (!currentLink) return;

  const hash = currentLink.hash;
  // スムーススクロールを無効にする条件をチェックし、スムーススクロールを無効にする場合は処理を中断
  if (shouldSkipSmoothScroll(currentLink, hash)) return;

  // アンカーリンクのハッシュ部分からターゲット要素を取得
  const targetId = hash === '#top' ? 'top' : decodeURIComponent(hash.slice(1));
  const target = targetId === 'top' ? document.body : document.getElementById(targetId);

  if (target) {
    // デフォルトのリンク遷移を防止
    event.preventDefault();
    // ターゲット要素までスムーズにスクロール
    scrollToTarget(target);
    // ターゲット要素にフォーカスを設定
    focusTarget(target);
    // ブラウザの履歴にアンカーリンクのハッシュを追加
    if (hash !== '#top') {
      history.pushState(null, '', hash);
    }
  }
}

function cleanup(): void {
  if (clickHandler) {
    document.removeEventListener('click', clickHandler, { capture: true });
    clickHandler = null;
  }
}

export function initializeSmoothScroll() {
  // 既存のリスナーを削除
  cleanup();

  // 新しいリスナーを追加
  clickHandler = handleClick;
  document.addEventListener('click', clickHandler, { capture: true });
}

export function cleanupSmoothScroll(): void {
  cleanup();
}
