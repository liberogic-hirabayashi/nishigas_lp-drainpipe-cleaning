# CSS / SCSS 詳細リファレンス

SKILL.md の要約で足りないとき（トークンの正確な一覧、fluid計算の仕組み、mixin/functionの全容、Tailwind連携の詳細）に読む。

## 目次

1. [スタイルの読み込み構造](#スタイルの読み込み構造)
2. [デザイントークン一覧（cssVariables.scss）](#デザイントークン一覧)
3. [fluidサイズの仕組み](#fluidサイズの仕組み)
4. [SCSS functions](#scss-functions)
5. [SCSS mixins](#scss-mixins)
6. [SCSSトークン（$t-*）](#scssトークンt-)
7. [カスケードレイヤー](#カスケードレイヤー)
8. [Tailwind連携の詳細](#tailwind連携の詳細)
9. [全幅背景・ブレイクアウト](#全幅背景ブレイクアウト)
10. [stylelint](#stylelint)

## スタイルの読み込み構造

```
Layout.astro
├── import '@/styles/tailwind.css'   … Tailwind v4（CSS-first設定）
└── import '@/styles/globals.scss'   … グローバルCSSの実体
    ├── @forward 'cssVariables'      … :root のデザイントークン
    └── @forward 'base'              … base/_base.scss（リセット+基本スタイル）
                                        base/_utility.scss（.hide-down-md等）
                                        base/_interaction.scss（inviewアニメーション）

各コンポーネントの <style lang="scss">
└── @use '@/styles/global' as *;    … src/styles/global/_index.scss
    ├── @forward 'tokens' as t-*     … $t-breakpoints-px, $t-spacing-names, $t-gap-breakpoints
    ├── @forward 'mediaqueries'      … mq-up / mq-down / mq-only / mq-between / orientation
    ├── @forward 'functions'         … rem() / vw() / strip-unit() / str-replace() / svg-color()
    ├── @forward 'mixins'            … hover
    └── @forward 'keyframes'
```

- `@/styles/global`（ディレクトリの `_index.scss`）はmixin/function/SCSS変数のみで**CSSを出力しない**。何度 `@use` してもCSSが重複しない。
- `globals.scss` / `cssVariables.scss` / `tailwind.css` をコンポーネントから読み込んではいけない（CSSが重複出力される）。

## デザイントークン一覧

`src/styles/cssVariables.scss` の `:root` で定義。**変更・追加はこのファイルで行う**（案件ごとにここを書き換えるのが前提の設計）。

### 色

```
--color-bg-body / --color-bg-section / --color-text / --color-primary / --color-secondary
--color-attention / --color-border / --color-border-input / --color-link
--color-muted / --color-placeholder / --color-disabled / --color-focus / --color-focus-bg
--color-white / --color-black / --color-shadow / --backdrop
```

`bg-*` の状態色（半透明トークン。ベース色に追従する）:

```
--color-bg-disabled   : color-mix(in srgb, var(--color-disabled) 20%, transparent)   // disabled の地・枠
--color-bg-readonly   : color-mix(in srgb, var(--color-disabled) 10%, transparent)   // readonly の地
--color-bg-attention  : color-mix(in srgb, var(--color-attention) 5%, transparent)   // エラー状態(aria-invalid)の地
--color-bg-tooltip    : color-mix(in srgb, var(--color-black) 80%, transparent)      // Tooltipパネルの地
```

- disabled/readonly のフォーム部品はこの `bg-*` を使う（濃度を変えたければ % を1箇所で調整、ベース色を変えれば追従）。border も disabled では地と同色にするため `border-color: var(--color-bg-disabled)`
- エラー状態はフォーム部品の `&[aria-invalid='true']` に `background: var(--color-bg-attention); border-color: var(--color-attention);`（Checkbox/Radio は塗りが `:checked` と競合するため枠色のみ）。`--color-attention` は白＋淡地でAA(4.5:1)を満たす濃さ（現 `#bf3838`）
- 透明度を変えたいときは `rgb(from var(--color-primary) r g b / 80%)`（relative color syntax）または `color-mix(... N%, transparent)` を使う

### z-index

`--z-modal: 1000` / `--z-top-layer: calc(infinity)`。新しい階層が必要ならここに追加して名前で管理する。

### フォント

- `--font`: 基本フォントスタック（Local Noto Sans JP は _base.scss の @font-face でローカルフォント参照）
- `--leading-trim`: `calc((1em - 1lh) / 2)`。行送りの上下余白を打ち消す。`margin-block: var(--leading-trim)` で使用（Headingコンポーネント参照）

### フォントサイズスケール

スケールは `xs / sm / base / lg / xl / 2xl / 3xl / 4xl / 5xl`。各スケールに `-min` / `-max`（単位なし数値、px相当）と、そこからclamp計算済みの完成値 `--text-*` が定義されている。具体値は案件ごとに差し替える前提なので、`cssVariables.scss` を直接確認する（スケール名の追加・削除は `_tokens.scss` の `$text-sizes` と同期が必要）。

### spacingスケール（fluid値として直接使える）

スケールは `3xs 〜 5xl`。min/maxから計算済みの**完成値**なので `gap: var(--spacing-md)` とそのまま使う。具体値は `cssVariables.scss` を直接確認する（案件ごとに差し替え前提。スケール名の変更は SKILL.md「トークンを追加・変更するとき」の同期ルール参照）。

### transition / easing

- 既定値: `--default-property` / `--default-duration`(0.2s) / `--default-easing`(ease) / `--default-delay`
- easing: `--ease-in-sine` 〜 `--ease-in-out-back`（sine/quad/cubic/quart/quint/expo/circ/back の in/out/in-out 全24種）

### アイコン

`--icon-blank` / `--icon-arrow-right` / `--icon-pdf` / `--icon-checkbox` がSVG data URIで定義済み。使い方は `mask` + `currentcolor`:

```scss
&::after {
  width: 16px;
  height: 16px;
  content: '';
  background: currentcolor;
  mask: var(--icon-arrow-right) center / contain;
}
```

新しいアイコントークンを追加するときは、SVG内の `#` を `%23` にエスケープする（SCSSで色を差し込む場合は `svg-color()` 関数）。マークアップ内で使うアイコンは `src/icons/` + Astro Icon（`base/Icon.astro`）。

### テキスト横のアイコン垂直揃え

テキストの横にアイコンを並べる場合（注記、メタ情報、リスト項目、`::before`/`::after` で作るカスタムマーカーなど）、固定 `px` のマジックナンバーで位置を調整しない。本質は `calc((1lh - var(--_icon-size)) / 2)` という計算式で、これを `top`（`position: relative` 併用）か `margin-block-start` のどちらに使ってもよい（インラインレベルの要素同士なら見た目に差はない。縦マージン/オフセットは行ボックスの高さ自体には影響しないため）:

```scss
.icon {
  --_icon-size: 16px;
  position: relative;
  top: calc((1lh - var(--_icon-size)) / 2);
  flex-shrink: 0;
  width: var(--_icon-size);
  height: var(--_icon-size);
}
```

- `1lh` はその要素の `line-height` の計算値に等しい CSS 単位。テキストの行ボックス高さとアイコンサイズの差分を半分ずつ振り分けることで、1行目のテキスト中央にアイコンが揃う
- アイコンサイズが変わっても `--_icon-size` を変えるだけで揃う
- 複数行テキストでも1行目基準でズレない
- 固定 `px`（例: `margin-block-start: 2px`）のマジックナンバーは、フォントサイズや行高さが変わると破綻するため使わない。`top`/`margin-block-start` どちらの手段を使うにせよ、値は必ずこの計算式にする
- **`::before`/`::after` に適用する場合の注意**: `top` 版を使うなら疑似要素自身に `position: relative` が要る（親要素の position は継承されない）。書き忘れると `top` は無効化されるので、`margin-block-start` 版なら position の指定が要らない分ハマりにくい

### サイズ・レイアウト

- `--header-height`: 100px（md以下 80px）
- `--width-base`: 1080px / `--width-wide`: 1280px / `--width-narrow`: 800px
- `--side-gutter`: 左右余白（40px、md以下24px、%可変）
- `--contents` / `--contents-narrow` / `--contents-wide`: `min(calc(100% - var(--side-gutter) * 2), 各幅)` — コンテンツ幅の完成値
- `--rounded-xs`(2px) / `-sm`(4px) / `-md`(8px) / `-lg`(16px) / `-full`
- `--artboad-size`: デザインカンプの幅（1440、md以下375）。`vw()` 関数の基準値

## fluidサイズの仕組み

`_base.scss` が全要素（`*, ::before, ::after`）に `--size-clamp` の計算式を定義している。仕組み:

- `--clamp-min` / `--clamp-max`（単位なし、px相当）から、ビューポート `--clamp-viewport-min`(375) 〜 `--clamp-viewport-max`(1440) の間で線形補間するclamp値を算出
- 継承ではなく**各要素で再計算**されるため、使いたい要素自身に `--clamp-min/max` をセットして `font-size: var(--size-clamp)` と書く

基本は計算済みの `var(--text-*)` を1行で使う（SKILL.md参照）。場所によりサイズを調整したいときは、`--clamp-min/max` + `var(--size-clamp)` の3行方式で任意の値を指定できる:

```scss
// 定義済みスケールのmin/maxを片側だけ差し替える微調整
.title {
  --clamp-min: var(--text-3xl-min);
  --clamp-max: 40;
  font-size: var(--size-clamp);
  line-height: 1.4;
}

// スケール外の一点もの
.hero-title {
  --clamp-min: 28;
  --clamp-max: 56;
  font-size: var(--size-clamp);
}
```

`--clamp-min/max` を指定しない要素の `--size-clamp` は base スケール（bodyの基本サイズ）になる。

spacing側（`--spacing-*`）は同じ考え方の計算が cssVariables.scss 内で済んでいる完成値。さらに `min(min値/375 * 100vw, clamp(...))` で375px未満でも縮む。

## SCSS functions

```scss
rem(16)        // => calc(16 / var(--base-font-size) * 1rem)。px感覚でremを書く
vw(16)         // => --artboad-size(1440/375)基準で可変するvw値。カンプ準拠の可変サイズに
vw(16, 750)    // 基準ビューポートを明示指定
strip-unit($v) // 単位を除去
str-replace($string, $search, $replace)
svg-color('#0061c2') // => %230061c2。SVG data URIに色を埋め込むとき
```

`rem()` は `--base-font-size` に依存するcalc値を返すため、`font-size` 以外（padding等）にも安全に使える。

## SCSS mixins

### メディアクエリ

ブレイクポイント定義（`_tokens.scss` の `$breakpoints-px`）: `2xs: 0 / xs: 240px / sm: 576px / md: 768px / lg: 992px / xl: 1200px / 2xl: 1400px`

```scss
@include mq-down(md) { ... }        // (max-width: 767px) ← 基本これ（デスクトップファースト）
@include mq-down(xs) { ... }        // (max-width: 239px) SP 200%ズーム調整用
@include mq-up(md) { ... }          // (min-width: 768px)
@include mq-only(md) { ... }        // (min-width: 768px) and (max-width: 991px)
@include mq-between(sm, lg) { ... } // (min-width: 576px) and (max-width: 991px)
@include orientation(landscape) { ... }
```

`mq-down(名前)` は「その名前のブレイクポイント値 − 1px 以下」。

### hover

```scss
@include hover { ... }       // (any-hover: hover) の :hover と、:focus-visible の両方に適用
@include hover(none) { ... } // タッチデバイスでのhover
```

## SCSSトークン（$t-*）

`_tokens.scss` の変数は `$t-` プレフィックスで再エクスポートされる:

- `$t-breakpoints-px` — ブレイクポイントmap
- `$t-text-sizes` — フォントサイズスケール名のリスト。cssVariables.scss の `--text-*` 生成ループで使用
- `$t-spacing-names` — `('0', '3xs', ..., '5xl')`。gap系propsのループ生成用
- `$t-gap-breakpoints` — `('lg', 'md', 'sm')`。レスポンシブgap propsを生成する対象ブレイクポイント

使用例は component-patterns.md の Stack/Grid パターン参照。

## カスケードレイヤー

| レイヤー | 中身 |
| :-- | :-- |
| `@layer base` | リセット、要素既定スタイル、utility class、inviewアニメーション |
| `@layer components` | 各Astroコンポーネントのスタイル（**コンポーネントでは必ずこれで包む**） |
| レイヤー外 | Tailwindユーティリティ等（レイヤーより優先される） |

レイヤーのおかげで詳細度競争が起きない。`!important` は書かない（既存の使用箇所は base の utility とアクセシビリティ強制のみ）。

## Tailwind連携の詳細

`src/styles/tailwind.css`（Tailwind v4 CSS-first設定）で以下がカスタム済み:

- **ブレイクポイントvariantはmax-widthベースに上書き**: `sm:`=575px以下, `md:`=767px以下, `lg:`=991px以下, `xl:`=1199px以下, `2xl:`=1399px以下。**Tailwind標準（min-width）と逆**なので注意
- `text-xs`〜`text-4xl` は `@utility` でfluid font-size（`--size-clamp` 機構）に差し替え済み
- `--color-*` / `--spacing-*` トークンが `@theme inline` で登録済み → `bg-primary` `gap-md` `p-lg` などが使える
- `leading-trim` / `leading-trim-top` ユーティリティあり
- ダークモードはclass方式（`@custom-variant dark`）

### preflightと自作base（_base.scss）の関係

両者は**同じ `@layer base` に結合**され、読み込み順で自作baseが後（tailwind.css → globals.scss）。レイヤーで決着するcomponents/utilitiesと違い、この2者間だけは素の詳細度＋記述順の勝負になる。自作baseはpreflightを上書きできる側なので、`:where()` で詳細度を(0,0,0)に落とすとpreflightの要素セレクタに負ける（例: `hr` はpreflightが `color: inherit; border-top-width: 1px` を持つため素のセレクタで書く）。

**`:where()` を使うのは次の2つの場合だけ**。どちらにも該当しないルールでは無意味（components/utilities・レイヤー外のCSSには詳細度に関係なく負ける）なので使わない:

1. preflightよりさらに下に敷くリセット的な既定を書くとき（実際にはほぼ無い）
2. **同層内で、後段のルールに詳細度に関係なく負けるべき「既定値」を書くとき**。実例: `:where(button, [type='submit'], ...) { cursor: pointer }` は後段の `[disabled] { cursor: not-allowed }` 等の状態ルールと同プロパティで競合する。素のセレクタだと `[type='submit']` と `[disabled]` が同詳細度(0,1,0)になり記述順依存で壊れやすいが、`:where()` なら位置に関係なく状態側が勝つ。フォーカスリングの `:where(...):focus-visible` も同様

## デバイスごとの表示切替（.hide-down-* / .hide-up-*）

マークアップ側でのデバイス別の表示/非表示は、Tailwind の `md:hidden` ではなく **`base/_utility.scss` の専用 utility を使う**（基本形）:

| class | 意味 | 用途イメージ |
| :-- | :-- | :-- |
| `.hide-down-{bp}` | そのブレイクポイント**以下**で非表示（`.hide-down-md` = 767px以下で非表示） | PC側だけで表示 |
| `.hide-up-{bp}` | そのブレイクポイント**以上**で非表示（`.hide-up-md` = 768px以上で非表示） | SP側だけで表示 |

- `{bp}` は `sm` / `md` / `lg` / `xl` / `2xl`（`$breakpoints` と同じ）
- 同一要素に down / up を両方付けない（全デバイスで消える）
- コンポーネント内の SCSS での分岐は従来どおり `mq-down()`。この utility は**マークアップでの出し分け専用**（要素を2つ用意してPC/SPで出し分けるケースなど）

## 全幅背景・ブレイクアウト

ウインドウ幅100%の背景は **`<Section bg>`（Sectionに背景を持たせる）が基本形**。SectionInner の内側から親を突き破って全幅にしたいときだけ、以下のテクニックを使う。

### 要素ごと全幅に広げる（ブレイクアウト）

ウインドウ幅いっぱいの親要素（例: Section）に `container-type: inline-size` を指定し、広げたい要素に負のマージンをcqi基準で指定する:

```scss
.Section {
  container-type: inline-size;
}
.breakout {
  margin-inline: calc(50% - 50cqi);
}
```

`100vw` ではなく `cqi` を使うのがポイント。一般にvwはスクロールバー幅を含むため横スクロールが発生し得る（このテンプレートでは `:root` の `scrollbar-gutter: stable` によりChromeではvwからガター分が除外され差が出ないことを実測済み・2026-09。ただしブラウザ・設定依存）。cqi（コンテナのインラインサイズ基準）は「Sectionの実幅」が基準になるため、スクロールバーの扱いにも「Sectionがウインドウ全幅であること」にも依存しない。なおコンテナ不在時のcqiはsmall viewportへフォールバックして一応動くが、上記の保証がなくなるため頼らない。

**cqiブレイクアウトする要素には `data-breakout="true"` を付けるのが規約**。`Section.astro` はこの属性（値が `true` のもの）を持つ子孫がいる場合のみ `:has()` で自動的にコンテナ（`container-type: inline-size`）になる（`base/TableScroll.astro` の `breakout` prop はこの属性を出力する）。cqiは最も近いコンテナで解決されるため、Sectionより外側の境界（枠付きレイアウトの全幅など）を基準にしたい場合は `data-breakout="outer"`（TableScrollでは `breakout="outer"`）にしてSectionのコンテナ化を回避し、基準にしたい祖先へ `container-type: inline-size` を宣言する。

全Sectionに無条件で `container-type` を適用しないのは、`contain: layout style` 相当が伴い以下の副作用があるため（ブレイクアウトを使うSectionに限定して受け入れる。実害なしは確認済み・2026-09）:

- **`position: absolute` / `fixed` 子孫の包含ブロックになる**。ただし `popover` 属性・`<dialog>` はtop layerに描画されるためcontainmentの影響を受けない（Tooltip / Modal はコンテナ化したSection内で正常動作を実測確認済み）。素の `position: fixed` 要素は、ブレイクアウトと同じSection内に置くとビューポートでなくSection基準になるので注意
- **子孫のmarginがコンテナ境界を越えてcollapseしなくなる**。Sectionは `padding-top` を持ち、余白はpadding/gapベースの規約のため影響なし

### 背景色だけ全幅に敷く（単色限定）

レイアウト幅は変えずに、背景色だけを左右いっぱいまで伸ばす border-image トリック:

```scss
.full-bg {
  --_bg: var(--color-secondary);
  border-image: linear-gradient(var(--_bg) 0 0);
  border-image-slice: 0 fill;
  border-image-outset: 0 100vw;
}
```

- **ショートハンドにまとめない**: `border-image` のショートハンドはslash区切り（`/ /`）を含み、SCSSが `//` をコメントとして解釈して壊れるため、必ず上記のように個別プロパティで書く
- はみ出しは描画のみ（ink overflow）なので `100vw` でも横スクロールは発生しない
- 右側だけ伸ばす: `border-image-outset: 0 100vw 0 0;`
- 左側だけ伸ばす: `border-image-outset: 0 0 0 100vw;`
- グラデーションや画像背景には使えない（伸ばした部分は単色の引き伸ばしになる）。その場合は上のブレイクアウト方式を使う

## stylelint

`stylelint-config-standard-scss` + `stylelint-config-recess-order`。プロパティは recess order（position → display/box → typography → visual → animation の順）で書く。VSCode設定で保存時整形されるが、生成コードも最初から順序に沿わせること。
