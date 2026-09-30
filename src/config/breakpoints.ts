/**
 * ブレイクポイント定義(min-width 基準値)
 *
 * このプロジェクトでは max-width(モバイルファースト逆)ベースで運用するため、
 * 実際の media query は (max-width: value - 1) で使用する。
 *
 * @example
 * import { breakpoints, breakpointsMax } from '@/config/breakpoints';
 * // mediaQuery 用
 * mediaQuery.matches('md', ...);  // (max-width: 767px)
 * // HTML media 属性用
 * `(max-width: ${breakpointsMax.md}px)`  // "(max-width: 767px)"
 *
 * ⚠️ 同じ値を SCSS / Tailwind 側でも定義しているため、変更時は以下も合わせて更新が必要:
 * - src/styles/global/_tokens.scss($breakpoints-px)
 * - src/styles/tailwind.css(@custom-variant)
 */

export const breakpoints = {
  xs: 240,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  '2xl': 1400,
} as const;

export type BreakpointKey = keyof typeof breakpoints;

/**
 * max-width 用の値(各ブレイクポイント - 1)
 * mediaQuery や HTML media 属性で「以下」を表現するために使用。
 */
export const breakpointsMax = Object.fromEntries(
  Object.entries(breakpoints).map(([key, value]) => [key, value - 1])
) as Record<BreakpointKey, number>;
