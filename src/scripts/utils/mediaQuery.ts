import { breakpoints, type BreakpointKey } from '@/config/breakpoints';

/**
 * @example
 * import mediaQuery from '@/scripts/utils/mediaQuery';
 * md未満の場合に実行
 * mediaQuery.matches('md', (matches) => {
 *   if (matches) {
 *     func();
 *   } else {
 *     func();
 *   }
 * });
 * 1000px（任意の数値）未満の場合に実行
 * mediaQuery.matches(1000, (matches) => {
 *   if (matches) {
 *     func();
 *   } else {
 *     func();
 *   }
 * });
 */

// コールバック関数の型定義
type LayoutChangedCallback = (matches: boolean) => void;

const mediaQuery = {
  matches(query: BreakpointKey | number, layoutChangedCallback: LayoutChangedCallback): () => void {
    let mediaQuery: string;

    if (typeof query === 'number') {
      mediaQuery = `(max-width: ${query - 1}px)`;
    } else {
      mediaQuery = `(max-width: ${breakpoints[query] - 1}px)`;
    }

    const mql: MediaQueryList = window.matchMedia(mediaQuery);

    const listener = (event: MediaQueryListEvent): void => {
      layoutChangedCallback(event.matches);
    };

    // 初期値を即座に設定
    layoutChangedCallback(mql.matches);

    // イベントリスナーを設定
    mql.addEventListener('change', listener);

    // クリーンアップ用の関数を返す
    return () => {
      mql.removeEventListener('change', listener);
    };
  },
};

export default mediaQuery;
