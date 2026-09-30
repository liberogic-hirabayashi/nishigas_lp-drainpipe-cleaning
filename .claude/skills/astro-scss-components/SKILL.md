---
name: astro-scss-components
description: このAstro静的サイトテンプレート専用の、SCSS・Astroコンポーネント実装ルール集。このテンプレートはデザイントークン（CSS変数）・data属性variant・scoped SCSS・独自mixin・base/features/patterns/templatesの階層といった、コードを見ただけでは推測しきれない独自規約で統一されている。規約を外すと既存と不整合なコードになるため、src/components・src/pages・src/styles・src/layouts に少しでも触れる作業では、着手前に必ずこのスキルを参照すること。該当する作業の例：コンポーネントの新規作成・編集（ボタン、カード、FAQ・アコーディオン、料金表、モーダル、ヒーロー/FV、一覧など）、セクションやブロックの追加、ページの新規作成、レイアウト・グリッド・段組み・カラム構成、余白やセクション間スペースの調整、色・角丸・フォントサイズ・見出しスタイルの変更、レスポンシブ対応やスマホ表示の調整、画像コンポーネントの利用。「〜を作って」「〜を追加して」「〜の見た目を変えて/調整して」「スマホで〜」のようなUI・スタイル関連の依頼はほぼ該当する。一方で、ビルド設定・astro.config・sitemap・i18n・データJSON・素材変換スクリプト・JSロジック・Git操作など、コンポーネントやスタイルを伴わない作業には使わない。
---

# Astroコンポーネント & SCSS 実装ルール

このテンプレートは「デザイントークン（CSS変数）+ scoped SCSS + data属性variant」で統一されたAstro静的サイトテンプレート。
以下のルールに従うことで、既存コンポーネントと完全に一貫した実装になる。

詳細が必要になったら以下を読むこと:

- [references/css-rules.md](references/css-rules.md) — トークン一覧、fluidサイズの仕組み、mixin/function詳細、Tailwindとの使い分け
- [references/component-patterns.md](references/component-patterns.md) — コンポーネントの実例パターン集（variant、ループ生成、JS付き、グルーピング）
- [references/figma-parity.md](references/figma-parity.md) — Figmaデザインファイルとの1:1対応規約（命名・トークン対応表・Figmaを元にコーディングする際の読み取り方）。**Figmaを参照する/Figma由来の実装をする作業では必読**

## 最初に確認するファイル

| ファイル | 役割 |
| :-- | :-- |
| `src/styles/cssVariables.scss` | **全デザイントークンの定義（最重要）**。色・余白・フォントサイズ・角丸・easing・コンテンツ幅など |
| `src/styles/global/_index.scss` | コンポーネントから `@use` する共通エントリ（mixin/function/SCSSトークン） |
| `src/styles/global/_tokens.scss` | SCSS側トークン（`$t-*`）。ブレイクポイント、spacingスケール名 |
| `src/styles/base/_base.scss` | リセット + fluid font-size（`--size-clamp`）の計算機構 |

`globals.scss`（cssVariables + base の束ね）と `tailwind.css` は `Layout.astro` で一度だけ読み込まれる。コンポーネントから import しない。

## コンポーネントの配置階層

`src/components/` 配下は4階層 + utils。迷ったら「小さい方」に置かず、役割で判断する。

| 階層 | 基準 | 例 |
| :-- | :-- | :-- |
| `base/`（Lv1） | ボタンや見出しなどのUIパーツ。小さく再利用性が高い、構造やスタイルに特化したUI単位。余白調整・区切り線などの構造的ラッパーも含む | Button, Heading, Stack, Grid, Section, SectionInner, SectionItem |
| `features/`（Lv2） | メニューやカードなど、コンテンツの有無に関わらず、UIの機能や形が単体で完結するもの。baseの組み合わせも含む | Accordion, Modal, Tooltip, Breadcrumbs, Tab |
| `patterns/`（Lv3） | CTAエリアやスライダーなど、目的に応じて組まれた役割ごとのUIブロック。base/featuresの組み合わせも含む | CtaArea, HeroSlider |
| `templates/`（Lv4） | ページ構造や全体を構成する役割固定のコンテナ | GlobalHeader, GlobalFooter, MainContent, MetaHead |
| `utils/` | 表示制御などの機能ユーティリティ | DevelopmentOnly, ProductionOnly |

- 複数ファイルで1つの機能を構成する場合はサブディレクトリでまとめる（例: `features/tab/Tab.astro` + `TabButton.astro` + `TabPanel.astro`、`base/form/`）。
- 開発用・未公開のコンポーネントは `_` プレフィックス（例: `_LocaleSelect.astro`）。

### 独自に書く前に、既存コンポーネントを使う（大原則）

UIを実装するとき、まず `base/`・`features/` の既存コンポーネントで賄えないかを必ず確認し、あればimportして使う。生のタグ + scoped CSSで独自実装するのは、既存に該当がないと確認できたときだけ。scoped CSSは同じ見た目の二重実装に気づきにくく、サイト全体の一貫性が崩れる原因になるため、「意味のあるUIパーツはbaseに1つだけ存在し、各コンポーネントはそれをimportする」を原則にする。

代表的なbaseコンポーネント（迷ったら `src/components/base/` を一覧して探す）:

| 用途 | 使うもの |
| :-- | :-- |
| **見出し（h1〜h6）** | **必ず `Heading.astro`**（`tag`で文書構造、`lv`で見た目を分離。`lv` は `display` / `h1`〜`h6`、`href` でリンク付き見出しにできる）。見出しスタイルを当てるには `lv` の指定が必須（`lv` 省略時はスタイルが当たらない。HTMLタグとしての見出しだけ必要で共通スタイルは不要な場合に省略する）。基本は `tag` と `lv` を揃える（h1 → `lv="h1"`）。`lv="display"` はトップのHeroなど特別に目立たせたい見出し専用で、通常のページ見出しには使わない。サイト全体で見出しの見た目を統一するため、生の `<h2>` + 独自font-sizeを書かない |
| ボタン・CTA | `Button.astro`（`icon` で右アイコン、`space` で空き列の詰め/維持を指定、`modal` でモーダルを開くトリガーになる） |
| ボタン群の横並び | 基本的には `ButtonWrap.astro`（折り返し+gap内蔵、`justify` で寄せ・デフォルトcenter）。カード内など単体で配置する場合は `Button` を直接置いてよい |
| アイコンのみのボタン | `IconButton.astro`（`aria-label` 必須、`shape` で角丸/円形、`iconSize` でアイコンの大きさをボタン枠に対する割合(cqi)で調整。50〜95の5刻みプリセット・省略時60） |
| ラベル・タグ・カテゴリ | `Chip.astro` |
| リンク（本文中・アイコン付き） | `TextLink.astro` |
| リスト | `List.astro` / `ListItem.astro`（`type`: disc / decimal / paren / circle、`tag` で ul/ol 切替、`gap` で項目間隔） |
| 定義リスト（会社概要・スペック表など「項目名＋内容」の羅列） | `DescriptionList.astro` + `DescriptionItem.astro`（行ごとに `<DescriptionItem dt="項目名">内容</DescriptionItem>`。内容はslotなのでリスト・画像・地図なども入る。並びは `layout` prop: `responsive`（既定・PC横並び2列/SP縦積み）/`row`（常に横並び2列）/`column`（常に縦積み））。※2軸の比較表（プラン×機能など）は `dl` ではなく `base/Table.astro` を使う |
| 表組み | `Table.astro`（`variant`: border（既定・全セル囲み）/ line（囲みなし・行下線のみ）、`fixed` で列幅均等、`vertical` でセル縦位置（middle既定 / top）。中身は生の `thead`/`tbody` を直書き。はみ出す可能性がある表は `TableScroll.astro` で包む） |
| 表の横スクロール | `TableScroll.astro`（`Table.astro` を包む構造的ラッパー。見た目はTable側の責務で、こちらは挙動のみ。`label` 必須=スクロール領域の名前。role/tabindexはSSRで出力し、収まっている間はJSが外す（JS無効時は到達可能側に倒れる）。`breakout` でスクロール時に領域を基準コンテナの幅いっぱいへ拡張（cqiブレイクアウト。true=直近のSection基準・自動コンテナ化 / 'outer'=Sectionをコンテナにせず祖先に宣言した `container-type: inline-size` 基準）。包んだ表には `min-inline-size: max-content` を自動適用＝セルが折り返して潰れることなく自然な幅ではみ出す（例外的に折り返して収めたい表は `min-w-0` 等で上書き）。SPでのカード状への組み換えは持たない＝案件ごとに実装） |
| リード文・導入文 | `Lead.astro`（本文より一段大きい `<p>`） |
| アイコン | `Icon.astro` |
| 注釈・注記 | `Annotation.astro`。※などの注釈記号は本文に直書きせず `mark` prop に渡す（`<Annotation mark="※">本文</Annotation>`）。mark が先頭列に分離され、折り返し行が記号の後ろに揃うぶら下げインデントになる。`justify`（start / center / end）で寄せ。文字色を変えたい場合はTailwind（`class="text-muted"` / `class="text-attention"` 等）を使う |
| 縦積み・横並び・区切り | `Stack.astro`（`direction`、`gap` + `lgGap/mdGap/smGap`、`align` / `justify`、`wrap`、`divider` で区切り線） |
| グリッド・カラム | `Grid.astro` |
| セクション・コンテンツ幅 | `Section.astro` / `SectionInner.astro` / `SectionItem.astro` |
| 画像 | `<Image>`（astro:assets）/ `PictureImage.astro` |
| フォーム部品 | **必ず `base/form/`**（`Input` / `Select` / `Checkbox` / `Radio` / `Textarea`）を使う。ラベル・説明文・エラーの紐付けブロックは `features/FormBlock.astro`（使用はデザインに応じて任意）。使い方は下記「featuresの使い方」参照 |

代表的なfeaturesコンポーネント（タブ・アコーディオン・モーダルを自前実装しない）:

| 用途 | 使うもの |
| :-- | :-- |
| タブ切り替え | `Tab.astro` / `TabButton.astro` / `TabPanel.astro`（キーボード操作・ARIA・ハッシュ連動を内蔵） |
| アコーディオン・FAQ | `Accordion.astro`（`<details>` ベース、開閉アニメーション付き） |
| モーダル・ダイアログ | `Modal.astro`（`<dialog>` ベース、フォーカストラップ・`inert` 対応） |
| ツールチップ・補足情報 | `Tooltip.astro`（Popover API + CSS Anchor Positioning ベース、JSゼロで開閉・光背/Escで閉じる。位置決めは非対応ブラウザ向けJSフォールバック付き） |
| ハンバーガーメニュー | `HamburgerButton.astro` / `HamburgerContent.astro`（GlobalHeader 内で使用） |
| パンくずリスト | `Breadcrumbs.astro` |

### featuresの使い方（配線が必要なもの）

```astro
<!-- アコーディオン: タイトルは slot="summary"。`open` で初期展開、`name` を揃えると排他開閉 -->
<Accordion>
  <Fragment slot="summary">質問文</Fragment>
  回答コンテンツ
</Accordion>

<!-- タブ: TabButton の id / target と TabPanel の labelledby / id を呼び出し側で対応させる。
     パネル群は slot="tabPanels" にまとめ、初期表示のペアに active を付ける -->
<Tab>
  <TabButton target="panel-1" id="tab-1" active>タブ1</TabButton>
  <TabButton target="panel-2" id="tab-2">タブ2</TabButton>
  <Fragment slot="tabPanels">
    <TabPanel id="panel-1" labelledby="tab-1" active>タブ1 コンテンツ</TabPanel>
    <TabPanel id="panel-2" labelledby="tab-2">タブ2 コンテンツ</TabPanel>
  </Fragment>
</Tab>

<!-- モーダル: Button / IconButton の `modal` prop に Modal の `id` を渡して開く。
     `title`（表示見出し）か `label`（非表示の読み上げラベル）のどちらか必須。
     `closedby`（any / closerequest / none）で背景クリック・Escの閉じ方を制御 -->
<Button modal="sample-modal">開く</Button>
<Modal id="sample-modal" title="モーダルタイトル">
  <p>モーダル中身</p>
</Modal>

<!-- フォーム: 入力部品は base/form/ を使う。FormBlock はラベル・説明・エラーの紐付けを担う
     （labelFor と入力の id、descriptionId と aria-describedby を対応させる） -->
<FormBlock label="お名前" labelFor="name" description="例：山田 太郎" descriptionId="name-desc" required>
  <Input type="text" id="name" name="name" aria-describedby="name-desc" aria-required="true" />
</FormBlock>

<!-- ツールチップ: id は呼び出し側で一意な値を渡す。トリガーは既定でinfoアイコン(IconButton)、
     slot="trigger" で独自トリガーに差し替え可能（その場合 popovertarget={id}・popovertargetaction="toggle"・
     anchor-name の style を自分で付与すること） -->
<Tooltip id="tip-1" label="補足情報">補足の本文</Tooltip>

<!-- dismiss="button": 閉じるボタンで閉じる。リンク等の操作可能な要素も置ける -->
<Tooltip id="tip-2" label="補足情報" dismiss="button">
  詳しくは<TextLink href="#">こちら</TextLink>
</Tooltip>

<!-- position で表示位置(top/bottom/left/right)、timeout でdismiss="timeout"の自動クローズ時間(ms)を変更 -->
<Tooltip id="tip-3" label="補足情報" position="bottom" timeout={6000}>本文</Tooltip>
```

- **`Accordion.astro` の `.panel` には padding を設定しない**。`<details>` 直下の要素に padding をつけるとアニメーションの挙動がおかしくなるため、余白調整は `.panel > .content` に対して行う（`:global(.panel) > :global(.content) { padding: ... }`）
- **`Tooltip.astro` の `dismiss` はARIAロールが変わる**: `dismiss="timeout"` は `role="tooltip"` で実装（ARIAの規則上、tooltipロールの中にフォーカス可能な要素を置いてはいけないため閉じるボタン無し）。`dismiss="button"` は閉じるボタン（フォーカス可能）を含むため `role="tooltip"` を使わず汎用のポップオーバーとして実装している（`aria-label` で代替）。見た目は同じでも意味役割が違うので、閉じるボタンを後から追加するような改修をする場合はroleごと見直すこと
- 例: カードのカテゴリラベルとお知らせ一覧のカテゴリラベルは同じ意味のUI → 両方とも `Chip.astro` を使う（それぞれで独自のラベルを作らない）。見出しも同様に、どのpattern/featureでも `Heading.astro` を使う
- 既存baseで賄えない見た目なら、まず既存コンポーネントにvariant（`data-*` prop）を追加できないか検討し、それも不自然なら新しいbaseコンポーネントとして切り出してからimportする
- **同じスタイル定義が複数コンポーネントに繰り返されていたら、baseコンポーネントに抽出する**。scopedスタイルは重複に気づきにくいため、共通パターン（カードの説明テキスト、メタ情報の並びなど）が3箇所以上で同じCSS変数・プロパティを書いていたら共通化の合図。抽出後、呼び出し側で追加スタイルが必要な場合は `class` propsで渡してローカルスタイルで上書きする
- **import した子コンポーネントに `class` propを渡して調整する場合、`:global()` は不要**（前段の誤情報の訂正: 2026-07-23実例で確認）。Astroは親が渡した `class` の対象要素に親自身のスコープ属性も転送するため、親のscoped `<style>` に**通常のセレクタ**（`:global()` なし）で書くだけでマッチする。実例: `Tooltip.astro` が `<IconButton class="close">` と渡し、Tooltip側で単に `.close { position: absolute; ... }` と書けば効く（ビルド後のHTMLを見ると対象要素に子=IconButton自身のスコープ属性と、親=Tooltipから渡されたスコープ属性(`="true"`付き)の両方が付いている）。`:global()` が必要なのは次の2パターンのみ: ①class propとして渡していない、**子コンポーネント自身が内部で生成する**属性やクラス（例: IconButtonが自分の`size` propから出す `data-size` 属性）を上書きしたい時、②`<slot />` 経由で差し込まれる中身（呼び出し元＝別コンポーネントのスコープのままなので）を上書きしたい時
- **`:has()` の内部にはスコープ属性が付かない**（2026-09実測。`.Section:has([data-breakout='true'])` は `.Section[cid]:has([data-breakout=true])` にコンパイルされ、内部は素通し）。そのため `:has()` の条件にslot由来の要素を使う場合も `:global()` は不要。むしろ **`:has()` 内部に `:global()` を書くとコンパイラが処理できず、CSSに `:global(...)` が文字通り残って無効セレクタになる**（ビルドは通るのに実行時だけ効かない）。実例: `Section.astro` の `&:has([data-breakout='true'])`

## コンポーネントの基本形

新規コンポーネントは必ずこの骨格から始める:

```astro
---
import type { HTMLAttributes } from 'astro/types';

export interface Props extends HTMLAttributes<'div'> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const { variant = 'primary', size = 'md', class: className, ...rest } = Astro.props;
---

<div class:list={['ComponentName', className]} data-variant={variant} data-size={size} {...rest}>
  <slot />
</div>

<style lang="scss">
  @use '@/styles/global' as *;
  @layer components {
    .ComponentName {
      // ...
    }
  }
</style>
```

守るべき点:

1. **Props は `HTMLAttributes<タグ名>` を extends** し、`class` は `className` にリネームして受け、`...rest` を必ずスプレッドする（呼び出し側で class や aria 属性を追加できるようにするため）。
2. **ルート要素の class 名 = コンポーネント名（アッパーキャメルケース）**。`class:list={['ComponentName', className]}` の形で外部classとマージ。
3. **variant は class ではなく `data-*` 属性 + 型付きprops** で表現する（`data-variant`, `data-size`, `data-gap` など）。CSS側は `&[data-variant='primary']` で分岐。
4. **`<style lang="scss">` の先頭は必ず `@use '@/styles/global' as *;`**、スタイル全体を `@layer components { ... }` で包む。
5. **JSが必要なら同ファイル内に `<script>`** で書く。全ページ共通処理のみ `src/scripts/` + `entry.ts` へ。ただし**ページ（`<Layout>` を使うファイル）では `</Layout>` の後に書かない**（出力が `</html>` の外に出る）。`<Layout>` 内の `<Fragment slot="head">` に置く。
6. **コメントは「コードから読み取れない判断根拠」がある場合のみ**、簡潔に書く（なぜこの実装を選んだか・なぜあえて書かないか等）。処理内容の説明・仕様の言い換え・自明なpropsの敷衍は書かない。テンプレート内コメント・`<script>` 内・propsのJSDoc・CSSすべて同じ基準。背景説明が長くなるならコードでなくスキルや参照ドキュメント側に書く。

## CSSルール（最重要）

### 値は必ずトークンを使う

数値・色の直書きは「トークンが存在しない場合」のみ。以下は必ずCSS変数を使う:

| 用途 | 使うもの | 例 |
| :-- | :-- | :-- |
| 色 | `--color-*` | `color: var(--color-text);` `background: var(--color-primary);` |

`--color-text` は `body` に設定済みなので、通常のテキストには `color` 指定不要（継承される）。`color: var(--color-text)` を明示するのは、親から白色等を継承していて上書きが必要な場合のみ。`--color-muted` は注釈・補足・メタ情報など**意図的に目立たせたくないテキスト専用**。

| 余白・gap | `--spacing-3xs`〜`--spacing-5xl` | `gap: var(--spacing-md);`（ビューポート幅で自動的に可変するfluid値） |
| フォントサイズ | `--size-clamp` + `--clamp-min/max` | 下記参照 |
| 角丸 | `--rounded-xs/sm/md/lg/full` | `border-radius: var(--rounded-sm);` |
| 影 | `--shadow-xs/sm/md/lg/xl/2xl` | `box-shadow: var(--shadow-md);`（影色はカラートークン `--color-shadow` で差替可） |
| transition | `--default-duration` `--ease-*` | `transition: opacity var(--default-duration) var(--ease-out-quad);` |
| z-index | `--z-modal` `--z-top-layer` | 新しい階層が必要なら cssVariables.scss に追加 |
| コンテンツ幅 | `--contents` `--contents-narrow` `--contents-wide` | 通常は `SectionInner` コンポーネントに任せる |

### フォントサイズはfluid（clamp）方式

定義済みサイズは `var(--text-*)` で1行指定できる。`cssVariables.scss` で `@each` ループにより clamp 計算済み変数が生成されている:

```scss
// 定義済みサイズ（推奨・1行で済む）
.title {
  font-size: var(--text-2xl);
  line-height: 1.4;
}
```

スケールは `xs / sm / base / lg / xl / 2xl / 3xl / 4xl / 5xl`（`base` がbodyのデフォルト）。各サイズの実際の min/max 値は案件ごとに差し替える前提なので、スキルに書かれた値ではなく `cssVariables.scss` の `--text-*-min/max` を確認する。

定義済みスケールに収まらない一点もののサイズのみ、従来の3行方式を使う:

```scss
// 外れるサイズ（一点もの）
.special-title {
  --clamp-min: 28;
  --clamp-max: 48;
  font-size: var(--size-clamp);
}
```

**フォントサイズは原則すべて clamp 方式にする。** `rem()` を使う固定サイズは、装飾的なあしらい（ナンバーバッジ等のサイズが固定である必然性がある要素）に限定する。本文・見出し・ラベル・注釈など、テキストとして読まれる要素には必ず clamp を適用すること。`px` 直書きはアイコンサイズ等の非テキスト要素のみ。

### 論理プロパティを使う（特にmargin / padding）

物理方向（top/right/bottom/left）ではなく論理プロパティで書く。既存コンポーネントも `margin-inline: auto` / `padding-block` / `inset-inline` で統一されている:

| 書かない | 書く |
| :-- | :-- |
| `margin-top: ...` | `margin-block-start: ...` |
| `margin: 0 auto` | `margin-inline: auto` |
| `padding: 8px 16px` | `padding-block: 8px; padding-inline: 16px` |
| `left: 0; right: 0` | `inset-inline: 0` |

上下・左右の4方向すべて指定する場合など、論理プロパティで冗長になるケースは無理をしなくてよい（`padding: var(--spacing-md)` 等の全方向指定はそのまま）。

### なんでもflexにしない（gridの積極活用）

flexを既定にせず、レイアウトの性質で選ぶ:

- **grid**: 並べる数・領域があらかじめ決まっているもの。カラムレイアウト、カード一覧、「日付+ラベル+タイトル」のような固定構造の行（`grid-template-columns: auto auto 1fr`）、重ね配置（`grid-area: 1 / 1`）
- **flex**: 内容量に応じて自然に流す・折り返すもの。タグの羅列、ボタン群、中身の幅が不定な横並び
- 一覧のカラム配置はまず `base/Grid.astro`（`col` / `mdCol` props）、縦積み・単純な横並びは `base/Stack.astro` の再利用を検討してから自前実装する

### メディアクエリはmixinで、デスクトップファースト

```scss
.ComponentName {
  padding: var(--spacing-lg);
  @include mq-down(md) {
    // 767px以下
    padding: var(--spacing-sm);
  }
}
```

基本は `mq-down`（max-width）。`mq-up` / `mq-only` / `mq-between` / `orientation` も使用可。ブレイクポイントは `2xs / xs / sm / md / lg / xl / 2xl`。生の `@media (max-width: 768px)` は書かない。

### hoverは専用mixin

タッチデバイス除外 + `:focus-visible` 対応が組み込まれているため、生の `&:hover` は書かない:

```scss
@include hover {
  --_bg-color: rgb(from var(--color-primary) r g b / 80%);
}
```

### コンポーネント内ローカル変数は `--_` プレフィックス

variantやhoverでの上書きポイントを `--_` 付きCSS変数として定義するのがこのテンプレートの核心パターン:

```scss
.Button {
  --_bg-color: white;
  --_color: var(--color-link);
  color: var(--_color);
  background: var(--_bg-color);
  &[data-variant='primary'] {
    --_bg-color: var(--color-primary);
    --_color: #fff;
  }
}
```

### class命名とCSSセレクタ

- **ルート要素には必ずコンポーネント名のclassをつける**（`<div class="Comparison">`）。CSSはこのクラスをルートにネストして書く（`.Comparison { th { ... } .card { ... } }`）。ルートが `Stack` や `Grid` などの子コンポーネントの場合は、外側に `<div class="ComponentName">` を追加してラップする。
- **HTML要素セレクタで済むならclassをつけない**: `table`, `th`, `td`, `ul`, `li`, `dl`, `dt`, `dd`, `h3`, `p` などは、コンポーネント名のネスト内であれば要素セレクタで十分（`.Pricing ul {}`, `.Pricing li {}`）。classが必要なのは、同じ要素が異なる役割で複数存在する場合や、種別・状態の区別が必要な場合（`.highlight`, `.label`）のみ。
- **子要素にclassが必要な場合は汎用的な短い名前**（Astroの `<style>` はscopedなので、`.ComponentName__child` のようなBEM風の命名は不要。短い名前でも他コンポーネントと衝突しない）: `.inner`（直下を内包）、`.content`（塊）、`.head` / `.foot`、`.image`、`.text`、`.title`、`.summary` / `.panel` など。
- **ハイフン始まりのclassはJSによる状態トグルに限定**: `.-open`, `.-required`, `.is-closing`。静的なvariantはdata属性を優先。要素の分類・種別を表すclass（`.highlight`, `.label`, `.recommended` など）にはハイフンをつけない。
- `:global()` が要るのは「`<slot />` 経由の中身」と「子コンポーネント自身が内部で生成する属性・クラス」を上書きする時（影響範囲を最小に。直下セレクタ `> :global(*)` 推奨）。**子に渡した `class` prop を対象にする時は不要**（詳細は「既存コンポーネントで賄えるか確認」章末の注記）。
- **ネスト内の記述順は「要素自身のスタイルを先に、子要素セレクタを後に」**: 自身のプロパティ → 自身のメディアクエリ → 自身の疑似要素・状態（`&::after`, `&:has()` 等）→ 子要素セレクタ、の順。自身と子のスタイルを混在させない。
- **セレクタ間に空行を入れず詰めて書く**。コメントはコードから読み取れない意図がある場合のみ（セレクタ名や値から自明な説明コメントは書かない）。

### 同一コンポーネントの複数配置とID衝突

1ページに同じコンポーネントを複数置く場合、`id` が重複すると衝突する。Tab（TabButton / TabPanel の `id` / `target` / `labelledby`）や Modal（`id`）は呼び出し側がIDを渡す設計なので、ページ内で一意な値を渡すこと。新しくID連携が必要なコンポーネントを作る場合も同様に、内部に固定IDを埋め込まず props で受け取る設計にする。なお、ランダムID（`crypto.randomUUID()` 等）はビルドのたびに変わるため使わない。

### レイアウトはプリミティブに任せる

セクション・余白・グリッドは既存のbaseコンポーネントで組む。コンポーネントに場当たり的な `margin` を足さない:

```astro
<Section>
  <SectionInner width="narrow">
    <Stack gap="lg" mdGap="md">
      <Grid col={3} mdCol={1} gap="md">...</Grid>
    </Stack>
  </SectionInner>
</Section>
```

コンテンツ幅は `SectionInner` の `width` prop（→ `data-width` 属性）で切り替える。自前で `max-width` を書かない:

| 指定 | 幅 |
| :-- | :-- |
| （デフォルト） | `--contents`（1080px + 左右ガター） |
| `width="narrow"` | `--contents-narrow`（800px） |
| `width="wide"` | `--contents-wide`（1280px） |
| `width="full"` | 100%（全幅。背景を端まで敷く場合など） |

見た目の比較サンプルは `src/pages/demo/index.astro` の「contents width」セクションにある。幅の実値を変えたい場合は `cssVariables.scss` の `--width-base/-narrow/-wide` を変更する。

ウインドウ幅100%の背景は `<Section bg>` が基本形。SectionInner の内側から突き破って全幅にしたい場合のテクニック（cqiブレイクアウト / border-imageトリック）は [css-rules.md](references/css-rules.md) の「全幅背景・ブレイクアウト」を参照。

gap/colのようなスケール連動propsを持つコンポーネントを新設する場合は、`$t-spacing-names` / `$t-gap-breakpoints` での `@each` ループ生成パターンを使う（[component-patterns.md](references/component-patterns.md) 参照）。

### Stack/Gridの過剰ネストを避ける

Stack・Gridは**セクションレベルの構造**に使う。カードやリストアイテムなど、内部が単純な縦積みで済む要素にまでStackを入れると、不要なDOMネストが増えるだけ。**親要素に直接 `display: flex; flex-direction: column; gap` を書けば済む場面ではそうする**:

```astro
<!-- ❌ 過剰: カード内にStackを入れている -->
<div class="card">
  <Stack gap="sm">
    <IconBox>...</IconBox>
    <h3>タイトル</h3>
    <p>説明文</p>
  </Stack>
</div>

<!-- ✅ 適切: cardに直接レイアウトを指定 -->
<div class="card">
  <IconBox>...</IconBox>
  <h3>タイトル</h3>
  <p>説明文</p>
</div>
```
```scss
.card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
```

判断基準: **Stackのprops（`gap` のレスポンシブ切り替え `mdGap`、`direction` の切り替え等）を活用しているか**。単に `gap` を1つ指定するだけなら、CSSで直接書いたほうがシンプル。

## 画像・アイコン

画像は `src/images/` に置いて `import` し、astro:assets 経由で出力する（ビルド時最適化 + width/height自動付与でCLS防止）。`public/` に置くのはOGP画像・faviconなど加工せずそのまま配信するものだけ。`<img src="/images/...">` の直書きはしない。

**基本形はこれ（固定幅 + Retina対応 + avif）**。迷ったらまずこの形:

```astro
<Image src={photo} alt="" width={640} densities={[1.5, 2]} format="avif" quality={50} loading="lazy" />
```

- **SVGの場合**は `densities` / `format` / `quality` は不要（`width` と `loading` のみ）
- **ファーストビューの画像**は `loading="eager"` + `fetchpriority="high"` に変更。それ以外は `loading="lazy"`
- 装飾画像・隣にテキストがある画像は `alt=""`

特殊用途（実例は `src/pages/demo/index.astro` の「画像」セクション参照）:

| 用途 | 使うもの | ポイント |
| :-- | :-- | :-- |
| ヒーロー・全幅画像 | `<Image>` | `widths={[800, 1280, 1920, 2560]} sizes="100vw"` |
| PCとSPで別画像（アートディレクション） | `base/PictureImage.astro` | `src`/`spSrc` で出し分け。切替は767px以下（`mediaQuery` propで変更可） |
| フォーマットフォールバック | `<Picture>` | `formats={['avif', 'webp']}` |

画像を受け取るコンポーネントは props を `ImageMetadata` 型で受けて内部で `<Image>` に渡す（差し替え自由度が必要なら名前付きslotとの併用も可）。

### アイコン

マークアップ内のアイコンは `base/Icon.astro`。`src/icons/` に置いたSVGをファイル名（拡張子なし）の `name` で参照し、`currentColor`・`1em` で文字色・文字サイズに追従する。塗りアイコン・線アイコン（Lucide等）どちらもroot属性を引き継いで正しく描画される。**装飾用途（隣にテキストがある場合）は必ず `aria-hidden` を付ける**:

```astro
<Icon name="arrow-right" aria-hidden />

<!-- Buttonのslotに入れる場合 -->
<Button href="#" icon="none">
  <Fragment slot="icon-left"><Icon name="arrow-right" aria-hidden /></Fragment>
  ボタン
</Button>
```

**アイコンの追加は [Lucide](https://lucide.dev/) から**。SVGをダウンロードして `src/icons/` に **Lucide公式名のまま**置く（例: `copy.svg`, `chevron-down.svg`）。`_` や `icon_` などのプレフィックスは付けない。Lucideに存在しない案件固有アイコン（ロゴ等）も同じくプレフィックスなしのkebab-caseで置く。未使用のアイコンファイルはビルド出力に含まれないため、残っていても害はない。

アイコンのみのボタンは `Button` に `Icon` を入れて自作せず、`IconButton.astro` を使う（`aria-label` 必須、アイコンは中に `<Icon aria-hidden />` で渡す）。アイコンが枠に対して大きい/小さいときは `iconSize`（50〜95の5刻み、cqi）で調整する。CSS内で使うアイコン（ボタンの矢印など）は `--icon-*` トークン + `mask`（[css-rules.md](references/css-rules.md) 参照）。

### テキスト横のアイコン垂直揃え

テキストの横にアイコンを並べる場合（`::before`/`::after` で作るリストマーカー・カスタム箇条書きも含む）、固定 `px` のマジックナンバーで位置を調整しない。`calc((1lh - サイズ) / 2)` を `top`（`position: relative`併用）か `margin-block-start` に使い、テキストの1行目に正確に中央揃えする。詳細は [css-rules.md](references/css-rules.md) の「テキスト横のアイコン垂直揃え」参照。

### Tailwindの使い分け

コンポーネントを作るまでもない一回限りのスタイリングや、ページ側での微調整（`mt-0` で余白を打ち消す等）にはTailwindユーティリティを使う。ユーティリティ的なclass（`.no-mt` 等）を自作せず、Tailwindで済ませる。注意点:

- このプロジェクトのTailwindブレイクポイントvariant（`md:` 等）は **max-widthベースに上書き済み**（Tailwind標準のmin-widthと逆）
- **デバイスごとの表示/非表示は Tailwind（`md:hidden`）でなく専用utilityを使う**: `.hide-down-md`（767px以下で非表示＝PC側で表示）/ `.hide-up-md`（768px以上で非表示＝SP側で表示）。`sm`〜`2xl` 各ブレイクポイントあり。詳細は [css-rules.md](references/css-rules.md) の「デバイスごとの表示切替」
- `text-xs`〜`text-4xl` はfluid font-sizeに差し替え済み、`--spacing-*` / `--color-*` トークンも登録済み
- コンポーネントの中身のスタイルはSCSSで書く。Tailwindとscoped SCSSを1コンポーネント内で混在させて複雑化させない

## トークンを追加・変更するとき

新しい色や余白が必要なら、直書きせず `cssVariables.scss` にトークンを追加する。ただし**以下は複数ファイルで同期が必要**（各ファイル冒頭の⚠️コメント参照）:

- **ブレイクポイント変更**: `src/styles/global/_tokens.scss` + `src/config/breakpoints.ts` + `src/styles/tailwind.css`（@custom-variant）
- **spacingスケール変更**: `src/styles/global/_tokens.scss` + `src/config/spacing.ts` + `src/styles/cssVariables.scss` + `src/styles/tailwind.css`（@theme inline）

## アクセシビリティの既定事項

- **フォーカスリングは独自実装しない**。`_base.scss` でグローバル実装済み（`--color-focus` の outline + `--color-focus-bg` の box-shadow の2重リングで、どんな背景色の上でもコントラストが確保される設計）。コンポーネント側で `:focus` / `:focus-visible` のスタイルを書いたり、`outline: none` や box-shadow の上書きで壊したりしない。特に `:focus` セレクタはマウスクリックでも発火し、`:focus-visible` ベースのグローバル設計と挙動が食い違うため書かないこと。見た目を変えたい場合はトークン（`--color-focus` / `--color-focus-bg`）側で調整する。
- `[inert]`・`prefers-reduced-motion` もグローバルで対応済み。コンポーネント側で対応を重複させない。
- 外部リンク・PDFリンクには `sr-only` の補足テキストを入れる（`Button.astro` 参照）。
- `<a>` を無効化するときは `aria-disabled="true"` + `tabindex="-1"`（`disabled` 属性は `<button>` のみ）。
- 見出しは `Heading` コンポーネントで「タグ（`tag`）と見た目（`lv`）」を分離して使う。

## 実装後チェックリスト

- [ ] 配置階層（base/features/patterns/templates）は役割に合っているか
- [ ] 独自実装の前に既存base/featuresを使ったか（見出しは必ず `Heading`、ボタンは `Button`、ラベルは `Chip` など。同じ意味のUIを独自に作り込んでいないか）
- [ ] `@use '@/styles/global' as *;` + `@layer components` になっているか
- [ ] ルートclass名 = コンポーネント名（UpperCamelCase）、`class:list` で外部classをマージしているか
- [ ] 色・余白・角丸・easingにトークン（CSS変数）を使っているか（直書きしていないか）
- [ ] 色トークンは用途どおりか（トークンを使えているかだけでなく、そのトークンの意味に合った使い方か）
- [ ] フォントサイズは `var(--text-*)` か、外れるサイズは `--clamp-min/max` + `var(--size-clamp)` か
- [ ] メディアクエリは `mq-down` 等のmixinか
- [ ] margin / padding は論理プロパティか、レイアウトはflex一辺倒でなくgridを適材適所で使っているか
- [ ] hoverは `@include hover` か
- [ ] `:focus` / `:focus-visible` のスタイルを独自に書いていないか（フォーカスリングはグローバル対応済み。`outline: none` で壊していないか）
- [ ] variantは `data-*` 属性 + 型付きpropsか
- [ ] 画像はastro:assets（Image / Picture / PictureImage）経由か、`loading` / `fetchpriority` は表示位置に合っているか
- [ ] コメントは「コードから読み取れない判断根拠」だけか（処理内容の説明・自明な言い換えを書いていないか）
- [ ] `npm run build` が通るか（stylelintのrecess-orderに沿ったプロパティ順か）
- [ ] `npm run lint` が通るか（ESLintにはjsx-a11yが入っている。生の `<a href="#">` はNG＝実在するパスを入れる。文脈上正当な指摘は該当行のみ `{/* eslint-disable-next-line ルール名 */}` + 理由コメントで無効化）
