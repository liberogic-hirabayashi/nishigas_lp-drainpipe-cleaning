/**
 * spacing スケール名
 *
 * Stack / Grid / List 等の gap props で使用するスケール名の型定義。
 *
 * ⚠️ 同じスケールを SCSS / CSS 側でも定義しているため、変更時は以下も合わせて更新が必要:
 * - src/styles/global/_tokens.scss($spacing-names)
 * - src/styles/cssVariables.scss(--spacing-*-min/max、--spacing-* 計算)
 * - src/styles/tailwind.css(@theme inline で --spacing-* を登録)
 */

export const spacingSizes = ['0', '3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const;

export type SpacingSize = (typeof spacingSizes)[number];
