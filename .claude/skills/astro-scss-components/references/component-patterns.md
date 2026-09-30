# コンポーネント実装パターン集

実在するコンポーネントから抽出した「型」。新規コンポーネントは最も近いパターンを下敷きにする。

## 目次

1. [variantを持つUIパーツ（Buttonパターン）](#1-variantを持つuiパーツbuttonパターン)
2. [スケール連動props（Stack/Gridのループ生成パターン）](#2-スケール連動propsstackgridのループ生成パターン)
3. [レイアウトプリミティブ（Section/SectionInner）](#3-レイアウトプリミティブsectionsectioninner)
4. [タグと見た目を分離する（Heading）](#4-タグと見た目を分離するheading)
5. [JS付きコンポーネント（Accordion）](#5-js付きコンポーネントaccordion)
6. [既存baseパーツの再利用（Chip in NewsList / Card）](#6-既存baseパーツの再利用chip-in-newslist--card)
7. [複数ファイル構成のグルーピング](#7-複数ファイル構成のグルーピング)
8. [propsの書き方の共通規約](#8-propsの書き方の共通規約)
9. [画像の実装パターン](#9-画像の実装パターン)
10. [ページの書き方](#10-ページの書き方)
11. [1枚ものLPの構成](#11-1枚ものlpの構成)

## 1. variantを持つUIパーツ（Buttonパターン）

`base/Button.astro` が代表例。要点:

- variant / size / icon を**ユニオン型props → data属性**に落とす
- 見た目の変化点を `--_` ローカル変数に集約し、variantセレクタでは変数の上書きだけを行う
- hoverは `@include hover` + `&:not(:disabled, .-disabled)` ガード
- アイコンはCSS `mask` + `--icon-*` トークン + `currentcolor`

```astro
---
export interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  class?: string;
}
const { variant = 'primary', size = 'md', class: className, ...rest } = Astro.props;
---

<button class:list={['Button', className]} data-variant={variant} data-size={size} {...rest}>
  <span><slot /></span>
</button>

<style lang="scss">
  @use '@/styles/global' as *;
  @layer components {
    .Button {
      --_bg-color: white;
      --_color: var(--color-link);
      color: var(--_color);
      background: var(--_bg-color);
      border-radius: var(--rounded-sm);
      transition: background var(--default-duration);
      &[data-size='sm'] {
        min-height: 32px;
        font-size: var(--text-sm);
      }
      &[data-variant='primary'] {
        --_bg-color: var(--color-primary);
        --_color: #fff;
        @include hover {
          &:not(:disabled, .-disabled) {
            --_bg-color: rgb(from var(--color-primary) r g b / 80%);
          }
        }
      }
    }
  }
</style>
```

その他Buttonにある実装の参考点:

- `href` の有無で `<a>` / `<button>` を出し分け（`{href ? (<a ...>) : (<button ...>)}`）
- `target="_blank"` に `rel="noopener"` と `sr-only` の「（新しいタブで開く）」を自動付与
- リンクの無効化は `aria-disabled="true"` + `tabindex="-1"`
- タップターゲット: md=44px, lg=56px の `min-height`
- 直交するprops設計: `icon`（どのアイコンを出すか）と `space`（`'fit'` = アイコンのない側を詰める / `'keep'` = アイコン幅のスペースとして維持）を分離。1つのpropに複数の役割を持たせない
- slotの有無によるレイアウト分岐はJS側で導出属性を吐かず、CSSの `:has(> svg:first-child)` / `:has(> svg:last-child)` で判定
- 調整しやすいよう `--_pad-x` / `--_pad-y` / `--_fit-space` のようにローカル変数化し、サイズvariantでは変数の上書きだけを行う

## 2. スケール連動props（Stack/Gridのループ生成パターン）

gap・カラム数のようにspacingスケールやブレイクポイントに連動するpropsは、`$t-*` トークンで `@each` ループ生成する。型は `@/config/spacing` の `SpacingSize` を使う:

```astro
---
import type { SpacingSize } from '@/config/spacing';
import type { HTMLAttributes } from 'astro/types';

export interface Props extends HTMLAttributes<'div'> {
  gap?: SpacingSize;
  lgGap?: SpacingSize; // lg以下で適用
  mdGap?: SpacingSize; // md以下で適用
  smGap?: SpacingSize; // sm以下で適用
}
const { gap = 'md', lgGap, mdGap, smGap, class: className, ...rest } = Astro.props;
---

<div class:list={['Stack', className]} data-gap={gap} data-gap-lg={lgGap} data-gap-md={mdGap} data-gap-sm={smGap} {...rest}>
  <slot />
</div>

<style lang="scss">
  @use '@/styles/global' as *;
  @layer components {
    .Stack {
      display: flex;
      gap: var(--_gap);
      // 基本gap
      @each $name in $t-spacing-names {
        &[data-gap='#{$name}'] {
          @if $name == '0' {
            --_gap: 0;
          } @else {
            --_gap: var(--spacing-#{$name});
          }
        }
      }
      // レスポンシブgap（lg→md→smの順でmq-downが後勝ちになる）
      @each $bp in $t-gap-breakpoints {
        @include mq-down($bp) {
          @each $name in $t-spacing-names {
            &[data-gap-#{$bp}='#{$name}'] {
              @if $name == '0' {
                --_gap: 0;
              } @else {
                --_gap: var(--spacing-#{$name});
              }
            }
          }
        }
      }
    }
  }
</style>
```

props命名は `lgGap` / `mdGap`（camelCase）、data属性は `data-gap-lg`（ケバブ）。Gridのカラム数は `@for $i from 1 through 12` で同様に生成。

## 3. レイアウトプリミティブ（Section/SectionInner/SectionItem）

ページのセクション構造はこの3層で組む。**個別コンポーネントに外側marginを持たせない**のが原則:

- `Section`: セクション間の余白が統一されるよう設計済み（`bg` propで背景付き）。仕組みはSection内部が持っているので、セクション間の余白を個別に調整したり、Section自体のスタイルを改変したりしない
- `SectionInner`: コンテンツ幅（`width: var(--contents)` + `margin-inline: auto`）。`width="narrow|wide|full"` で切替。`& + & { margin-top: var(--spacing-2xl) }`
- `SectionItem`: SectionInner内のブロック単位。`& + & { margin-top: var(--spacing-xl) }`

### 3層構造の目的: サイト全体での余白統一

複数ページのサイトでは、セクション間・ブロック間の余白がページごとにバラつくと統一感が損なわれる。Section/SectionInner/SectionItemの `& + &` による余白は、サイト全体で一貫したリズムを自動的に保つための仕組み。個別のコンポーネントやページで余白を都度指定する必要がなくなる。

```
Section                    ← セクション間: 3xl
├── SectionInner           ← コンテンツ幅制御 + ブロック群間: 2xl
│   ├── SectionItem        ← ブロック間: xl
│   │   └── (コンテンツ)
│   ├── SectionItem
│   │   └── (コンテンツ)
```

### SectionItemとStackの使い分け

この判断が必要なのは **セクション内のブロック間の余白を取る場面**。

- **SectionItem**: 複数ページのサイトでの基本。SectionInner直下のブロック間余白を `--spacing-xl` に固定し、サイト全体で統一したリズムを保つ
- **Stack**: 余白を柔軟に指定したい場合。`gap` propで自由に指定できる。SectionItemの余白が合わない場面ではStackを使う

Stackは汎用のレイアウトプリミティブであり、SectionItemの中や各コンポーネントの内部でも普通に使う。

1枚もののLPではページ間の統一という考え方がなく、柔軟に組む場面が多いため、SectionItemよりもStackの方が適している場合が多い

タグを切り替えられるようにする場合は `tag` prop + `const Tag = tag;` → `<Tag ...>` のパターン。

## 4. タグと見た目を分離する（Heading）

見出しは「文書構造上のタグ（`tag`）」と「見た目のレベル（`lv`）」を分離:

```astro
<Heading tag="h2" lv="h3">見た目はh3のh2見出し</Heading>
```

スタイル側は `.display` / `.h1`〜`.h6` classに `font-size: var(--text-*)`（定義済みfluidサイズ）+ `margin-block: var(--leading-trim) calc(var(--leading-trim) + 1em)` の型。

## 5. JS付きコンポーネント（Accordion）

- インタラクションはできるだけネイティブ要素（`<details>`, `<dialog>`, popover）で実装し、JSは補助に留める
- `<script>` は同ファイル末尾。共通ユーティリティは `@/scripts/utils/` から import
- 初期化は `DOMContentLoaded`（ViewTransition使用時は `astro:page-load` に切替、コメントで両方残す）
- JSが切り替える状態は `.-open` / `.is-closing` のようなハイフン/状態classか `data-active` 属性。CSSは `&[open]`, `&.-open` で反応
- JS無効環境への配慮: アニメーション系は `@media (scripting: enabled)` ガード（`base/_interaction.scss` 参照）

## 6. 既存baseパーツの再利用（Chip in NewsList / Card）

意味を持つ小さなUIは各コンポーネントで作り込まず、baseをimportして組み込む。代表例はカテゴリラベル = `base/Chip.astro`:

```astro
---
import Chip from '@/components/base/Chip.astro';
---
<li class="item">
  <time class="date" datetime={date}>{displayDate}</time>
  {category && <Chip variant="outline" size="sm">{category}</Chip>}
  <a class="title" {href}>{title}</a>
</li>

<style lang="scss">
  @use '@/styles/global' as *;
  @layer components {
    .item {
      // 子コンポーネントのルートはscoped対象外なので、ルートclass名（=コンポーネント名）を
      // :global の直下セレクタで参照して最小限の調整のみ行う
      > :global(.Chip) {
        flex-shrink: 0;
      }
    }
  }
</style>
```

- **hook用のclassを渡さない**: `<Chip class="chip">` のように参照用classを足すと `class="Chip chip"` と冗長な出力になる。ルートclass名（`.Chip`）をそのまま使う。classを渡すのは同じ子コンポーネントが複数並び区別が必要な場合のみ
- 見た目が合わないときは、独自スタイルを作る前に Chip 側への variant 追加を検討する
- ボタンは `Button`、見出しは `Heading`、アイコンは `Icon`、注釈は `Annotation` — 同じ判断を適用する

## 7. 複数ファイル構成のグルーピング

1機能=複数コンポーネントのときはサブディレクトリにまとめる:

```
features/tab/Tab.astro + TabButton.astro + TabPanel.astro
features/hamburger/HamburgerButton.astro + HamburgerContent.astro
base/form/Input.astro + Select.astro + Checkbox.astro + Radio.astro + Textarea.astro
```

親がslotで子を受ける構成にし、子は単体でも規約（ルートclass=コンポーネント名）を守る。

## 8. propsの書き方の共通規約

```ts
import type { HTMLAttributes } from 'astro/types';

export interface Props extends HTMLAttributes<'div'> {
  // ユニオン型で選択肢を明示。boolean propはoptional
  variant?: 'primary' | 'secondary';
  bg?: boolean;
}

const {
  variant = 'primary',      // デフォルト値は分割代入で
  bg,
  class: className,          // classは予約語なのでリネーム
  ...rest                    // 残りは必ずルート要素にスプレッド
} = Astro.props;
```

- 単純なコンポーネントでは `HTMLAttributes` を extends せず `class?: string` だけでも可（Button, Accordion がその例）だが、新規はextends推奨
- slotの有無で挙動を変えるときは `Astro.slots.has('slot名')`
- 名前付きslotは `icon-left` / `icon-right` / `summary` のようにケバブケース
- **親から子のスタイルを制御する前提のpropは作らない**（inline styleで `--_var` を注入して子コンポーネントに継承させる等）。子が自分のスタイルを持ち、親はコンテナに徹する。カスタマイズが要るなら子側のprop/classで受ける
- **使われない変数フォールバックを残さない**（誰も設定しない `var(--x, 既定値)` は直値にする）。将来の拡張を見越した未使用の受け口はYAGNIで作らない

## 9. 画像の実装パターン

サンプルは `src/pages/demo/index.astro` の「画像」セクション。画像ファイルは `src/images/` からimportする。

```astro
---
import { Image, Picture } from 'astro:assets';
import PictureImage from '@/components/base/PictureImage.astro';
import photo from '@/images/photo.png';
import photoSp from '@/images/photo_sp.png';
import photoSvg from '@/images/photo.svg';
---

{/* 1. 固定幅 + Retina対応 + avif —— 基本形。迷ったらこれ */}
<Image src={photo} alt="" width={640} densities={[1.5, 2]} format="avif" quality={50} loading="lazy" />

{/* 2. SVGの場合は densities / format / quality 不要 */}
<Image src={photoSvg} alt="" width={640} loading="lazy" />

{/* ファーストビューに置く場合は 1 の loading="lazy" を loading="eager" fetchpriority="high" に変える */}

{/* 3. レスポンシブ画像（ヒーロー用途。ビューポート幅と解像度でブラウザが選択） */}
<Image
  src={photo}
  alt=""
  widths={[800, 1280, 1920, 2560]}
  sizes="100vw"
  format="avif"
  quality={50}
  loading="eager"
  fetchpriority="high"
/>

{/* 4. アートディレクション（PC/SPで別画像。独自のbase/PictureImage.astro） */}
<PictureImage
  src={photo}
  spSrc={photoSp}
  alt=""
  width={640}
  height={360}
  spWidth={600}
  spHeight={600}
  densities={[1.5, 2]}
  format="avif"
  quality={50}
  loading="lazy"
/>

{/* 5. フォーマットフォールバック（AVIF → WebP → 元形式） */}
<Picture src={photo} alt="" width={640} formats={['avif', 'webp']} densities={[1.5, 2]} />
```

- `widths` の目安: 800w=小型スマホDPR2 / 1280w=現行スマホDPR2〜3 / 1920w=iPad・フルHD / 2560w=RetinaノートPC・QHD
- `PictureImage` のSP切替はデフォルト767px以下。`mediaQuery` propで変更可。height未指定ならアスペクト比から自動計算（CLS防止）
- コンポーネントが画像を受ける場合は `image: ImageMetadata` 型のpropsで受けて内部で `<Image>` に渡す（ArticleCardの例）。マークアップごと差し替えたい場合は名前付きslotを併用し `Astro.slots.has('image')` で分岐
- コンポーネント内で `<Image>` の出力imgを調整するときは `> :global(img)` で指定

## 10. ページの書き方

`src/pages/*.astro` は Layout に meta情報を渡し、コンポーネントを組み合わせるだけの薄いファイルにする:

```astro
---
import Layout from '@/layouts/Layout.astro';
import Section from '@/components/base/Section.astro';
import SectionInner from '@/components/base/SectionInner.astro';
import Heading from '@/components/base/Heading.astro';

const title = 'ページタイトル';
const description = 'ディスクリプション';
const current = 'about'; // GlobalHeaderのカレント表示用
---

<Layout title={title} description={description} url="/about/" metakey="default" current={current}>
  <Fragment slot="head">
    <script>
      // ページ固有のJSが必要な場合のみ
    </script>
  </Fragment>
  <Section>
    <SectionInner>
      <Heading tag="h1" lv="h1">ページタイトル</Heading>
      ...
    </SectionInner>
  </Section>
</Layout>

<style lang="scss">
  @use '@/styles/global' as *;
</style>
```

- import は `@/` エイリアス（`src/` 直下）を使う
- ページ固有の微調整スタイルのみページ内 `<style>` に書く。汎用化できそうならコンポーネント化する
- ページ固有の `<script>` は `<Layout>` 内の `<Fragment slot="head">` に置く。Astroは `<script>` をソース上の位置に出力するため、`</Layout>` の後（`<style>` の隣）に書くと `</html>` の外に出てしまう。`<style>` は Astro が `<head>` に集約するので末尾でよい

## 11. 1枚ものLPの構成

**1枚もの（複数ページでの使い回しがない）LPに限ったイレギュラーな構成**。ページ専用のセクション中身をpatterns/に切り出してページを見通しよく保つことが目的で、再利用性は求めない。通常のコーポレートサイトなど複数ページのサイトでは、複数ページでのコンポーネント流用が重要になるため、この構成ではなくSKILL.mdの配置階層ルール（再利用を前提としたbase/features/patternsの設計）に従うこと。

### patterns/ の粒度 = LPのセクション1つにつき1コンポーネント

LPのセクション（FV、CTA、FAQ、プラン比較など）1つにつき1つのpatternコンポーネントを作る。名前はそのセクションの「役割名」でつける（`Faq.astro`, `Cta.astro` など。`Section01` のような汎用名にしない）。どんなセクションを作るかはデザインに従う。

### ページの組み方: ページが構造、patternが中身

セクションリズム・背景・ページ内アンカー（`id`）は**ページ側のSection/SectionInnerが持ち**、patternコンポーネントは中身のブロックだけを持つ。こうすることでセクションの順序入替・背景変更・アンカー調整がページ1ファイルで完結する:

```astro
<Layout title={title} description={description} ...>
  <Fv />  {/* FVは全幅なのでSectionの外に置く例外 */}

  <Section id="importance">
    <SectionInner>
      <ImportanceTitle />
      <ImportanceTrends />
      <ImportanceMerit />
    </SectionInner>
  </Section>

  <Section id="plans" bg>
    <SectionInner>
      <Plans />
    </SectionInner>
  </Section>

  <Section>
    <SectionInner>
      <Faq
        accordion={[
          { summary: '費用はどのくらいかかりますか？', content: 'プランによって…' },
          { summary: '診断対象のページは…', content: '…' },
        ]}
      />
    </SectionInner>
  </Section>
</Layout>
```

ポイント:

- **patternはSection/SectionInnerを内包しない**（二重ラップ防止。ページから構造が一望できる）
- **コンテンツは基本的にHTML直書き**: 特長カード3枚、ステップ3つ、比較表の行など、少数の固定コンテンツはフロントマターに配列を作って`.map()`で回すより、HTMLを直接書く方が視認性が高い。配列+mapを使うのは、FAQのように件数が多い繰り返しや、ページ側からpropsで注入したいデータに限る
- **文言を直書きしても、同じ構造（マークアップ + scoped CSS）が並ぶなら構造はコンポーネント化する**。しきい値は同一ページ内で2回で検討・3回で抽出。切り出すのは構造だけで、文言は各呼び出しに直書きのまま（配列+mapにはしない）
- **繰り返しがなくても、まとまったセクション専用のscoped CSSやJSが増えるならコンポーネント化してよい**。狙いはそのセクションのマークアップ・スタイル・スクリプトを1ファイルに閉じ込め、CSSのscopeとJSの適用範囲をコンポーネント単位に収めること。ただしページの構造一望性とのトレードオフなので、ページ内 `<style>` / `<script>` が膨らんできたら検討する程度でよい
- patternの中はbase/featuresの組み合わせで組む（例: Faq = `Stack` + `features/Accordion`、ボタンは `Button`）
- 1つのセクション内に複数の小patternを並べてもよい（ImportanceTitle + ImportanceTrends + ImportanceMerit）
