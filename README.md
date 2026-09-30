# 静的サイトテンプレート（Astro）

[Astro](https://astro.build)で実装された静的サイトテンプレートです。  
ファイルフォーマットなどVSCodeの拡張機能と連携しますので、エディタはVSCodeを使用してください。


## 推奨環境

- Mac OS または Windows
- Node.js 24系（24.19.0以上。`mise.toml` / `.nvmrc` 参照）
- npm 11系
- VSCode


## VSCode設定

ワークスペース用の設定ファイルがパッケージに含まれています。  
フォルダをVSCodeで開けば、設定が適用されます。

以下機能拡張が必須です。  
※ワークスペース読み込み時に機能拡張インストールのアラートが出ます。  

- [astro-build.astro-vscode](https://marketplace.visualstudio.com/items?itemName=astro-build.astro-vscode)  
.astroファイルの言語サポート
- [dbaeumer.vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)  
構文チェック
- [esbenp.prettier-vscode](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)  
jsの整形
- [stylelint.vscode-stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)  
css、scssの整形


## コマンド

| Command                | Action                                             |
| :--------------------- | :------------------------------------------------- |
| `npm install`          | インストール                                          |
| `npm run dev`          | ローカルサーバーの立ち上げ `localhost:4321`               |
| `npm run build`        | `dist` へ本番用ファイルを出力                         |
| `npm run preview`      | ビルドをローカルでプレビュー                              |
| `npm run lint`         | ESLint + stylelint を実行                              |
| `npm run lint:js`      | ESLint のみ（.astro / .js / .ts）                       |
| `npm run lint:css`     | stylelint のみ（.astro 内 style / .scss）               |


## Lint

- ESLint: Prettier整形チェック、import順、Astroルール、アクセシビリティ（`eslint-plugin-jsx-a11y` の recommended を `.astro` テンプレートに適用）
  - jsx-a11y が検査するのは **生のHTML要素のみ**。`<Button href="#">` のようにコンポーネントのpropsとして渡した値は検査対象外
  - `dialog` 内の `autofocus` など、文脈上正当な箇所は該当行のみ `{/* eslint-disable-next-line ルール名 */}` で理由を添えて無効化する
- stylelint: `stylelint-config-standard-scss` + `recess-order`（プロパティ順）
- `package.json` の `overrides` について: `eslint-plugin-jsx-a11y` の peerDependencies が ESLint 9 までしか宣言していないため（ESLint 10 対応は[上流で作業中](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/issues/1075)）、この1本だけルートの `eslint` に合わせている。`eslint-plugin-jsx-a11y` 側が peerDependencies に ESLint 10 を含めた版をリリースしたら `overrides` は削除する


## ディレクトリ構造

```
/
├── public/（そのままdistにコピーされる）
├── src/
│   ├── components/
│   │   ├── base/（Lv1：ボタンや見出しなどのUIパーツ。小さく再利用性が高い、構造やスタイルに特化したUI単位。余白調整・区切り線などの構造的なラッパー要素も含む）
│   │   ├── features/（Lv2：メニューやカードなど、コンテンツの有無に関わらず、UIの機能や形が単体で完結するもの。baseを組み合わせて構成したものも含む）
│   │   ├── patterns/（Lv3：CTAエリアやスライダーなど、目的に応じて組まれた、役割ごとにまとまったUIのブロック。baseやfeaturesを組み合わせて構成したものも含む）
│   │   └── templates/（Lv4：ヘッダー、フッター、サイドバーなど、ページ構造や全体を構成するために役割が固定された構造やコンテナ）
│   ├── config/（ブレイクポイント・spacingスケールのTS定義）
│   ├── data/（JSONデータ）
│   ├── icons/（Astro Iconで使用するファイル）
│   ├── images/
│   ├── layouts/（ページテンプレート）
│   ├── lib/
│   ├── pages/（htmlファイルになるastroファイル）
│   ├── scripts/
│   └── styles/
└── package.json
```


## htmlの出力方法について
デフォルトではすべてindex.htmlとして出力されます。  
`/src/pages/dir.astro → /dist/dir/index.html`  

`astro.config.mjs` で、build.formatを'preserve'にすることでpagesの構造のまま出力されるようになります。  
`/src/pages/dir.astro → /dist/dir.html`  

<br>

Astroの詳細については[公式ドキュメント](https://docs.astro.build)をご確認ください。


---
## JSについて

各コンポーネント内に`<script></script>`で記述します。  
全ページ共通で使用するものについては`Layout.astro`に記述します。


---
## CSSについて
各コンポーネント内に`/src/styles/global`（共通の@mixin・@function群）を読み込んで`lang="scss"`で記述します。
```html
<style lang="scss">
  @use '@/styles/global' as *;
</style>
```
cssはastroコンポーネント内に書くことで、scopedになります。


### class命名ルール
コンポーネント名とコンポーネントのclass名は同じ名前とし、アッパーキャメルケースで命名します。  
スコープのため、子要素のclass名はBEMのようにBlockの名前を継承する必要はありません。  

他コンポーネントでstyleを上書きする場合は、:global()で部分的にスコープを無効にできます。  
（他の要素に影響しないように注意）

### 汎用class名
| class名         | 内容                                        |
| :-------------- | :----------------------------------------- |
| .inner          | コンポーネント直下をすべて内包したい場合             |
| .content        | コンポーネント内で塊をまとめたい時                 |
| .head           | .contentと並列でheaderに該当する箇所            |
| .foot           | .contentと並列でfooterに該当する箇所            |
| .image          | コンポーネント内で画像を含む塊                    |
| .text           | コンポーネント内でテキストを含む塊                 |
| .title          | コンポーネントのタイトルに該当する箇所              |

### variant
静的なvariant（色・サイズ違いなど）は、型付きpropsから`data-*`属性（`data-variant`、`data-size`など）に落とし込み、CSS側は`&[data-variant='primary']`で分岐します。  
JSで付け外しする状態classはハイフンから始め、マルチクラスにします（`.-open`など）。

### フォントサイズ
ビューポート幅（375px〜1440px）に応じて滑らかに可変する fluid font size を採用しています。  
定義済みサイズは `src/styles/cssVariables.scss` で定義されています。案件に合わせて min/max 値を変更してください。  
`var(--text-*)` で1行で指定できます。

```css
/* 定義済みサイズ（推奨） */
font-size: var(--text-sm);
font-size: var(--text-2xl);
```

#### 定義済みスケール（デフォルト）
| 変数 | min（375px） | max（1440px） |
| :-- | :-- | :-- |
| `--text-xs` | 10px | 12px |
| `--text-sm` | 12px | 14px |
| `--text-base` | 14px | 16px |
| `--text-lg` | 16px | 18px |
| `--text-xl` | 18px | 20px |
| `--text-2xl` | 20px | 24px |
| `--text-3xl` | 24px | 32px |
| `--text-4xl` | 32px | 40px |
| `--text-5xl` | 40px | 56px |

定義済みスケールに収まらない一点もののサイズのみ、3行方式を使います。

```css
/* 外れるサイズ（一点もの） */
.selector {
  --clamp-min: 28;
  --clamp-max: 48;
  font-size: var(--size-clamp);
}
```

Tailwind ユーティリティ（`text-sm`、`text-2xl` 等）も同じ fluid サイズに差し替え済みです。  
`rem()` を使う固定サイズは、装飾的なあしらい（サイズが固定である必然性がある要素）に限定してください。

### ユーティリティclass
ユーティリティ系はtailwindを使用します。  
コンポーネントを作成するまでもないスタイリングについては、tailwindを使用しても構いません。


---
## Sassについて
Dart Sassを使用しています。  
astroファイルから`/src/styles/global`を読み込むことで共通の@function、@mixin等が使用できます。  

### @functions、@mixin
`/src/styles/global/functions`  
`/src/styles/global/mixins`  
の各ファイルに使い方が書いてあります。

### メディアクエリー
`/src/styles/global/_tokens.scss`
```css
$breakpoints-px: (
  2xs: 0,
  xs: 240px,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  2xl: 1400px,
) !default;
```
※ブレイクポイントを変更する場合は `/src/config/breakpoints.ts`、`/src/styles/tailwind.css`（@custom-variant）も合わせて更新してください。

上記ブレイクポイントをもとに、min-width、max-widthで使用できます。  
基本的にはmax-width (desktop first)で使用します。
```css
@include mq-down(xs) {
  content: 'mq-down(xs) (max-width: 239px)'; // SP 200%ズーム調整用
}
@include mq-down(sm) {
  content: 'mq-down(sm) (max-width: 575px)';
}
@include mq-down(md) {
  content: 'mq-down(md) (max-width: 767px)';
}
@include mq-down(lg) {
  content: 'mq-down(lg) (max-width: 991px)';
}
@include mq-down(xl) {
  content: 'mq-down(xl) (max-width: 1199px)';
}
@include mq-down(2xl) {
  content: 'mq-down(2xl) (max-width: 1399px)';
}
```
min-width (mobile first)、一つのブレイクポイント間、任意のブレイクポイント間も指定できます。
```css
// #min-width (mobile firtst)
@include mq-up(sm) {
  content: 'mq-up(sm) (min-width: 576px)';
}
@include mq-up(md) {
  content: 'mq-up(md) (min-width: 768px)';
}
@include mq-up(lg) {
  content: 'mq-up(lg) (min-width: 992px)';
}
@include mq-up(xl) {
  content: 'mq-up(xl) (min-width: 1200px)';
}
@include mq-up(2xl) {
  content: 'mq-up(2xl) (min-width: 1400px)';
}

// #single breakpoints
@include mq-only(xs) {
  content: 'mq-only(xs) (min-width: 240px) and (max-width: 575px)';
}
@include mq-only(sm) {
  content: 'mq-only(sm) (min-width: 576px) and (max-width: 767px)';
}
@include mq-only(md) {
  content: 'mq-only(md) (min-width: 768px) and (max-width: 991px)';
}
@include mq-only(lg) {
  content: 'mq-only(lg) (min-width: 992px) and (max-width: 1199px)';
}
@include mq-only(xl) {
  content: 'mq-only(xl) (min-width: 1200px) and (max-width: 1399px)';
}
@include mq-only(2xl) {
  content: 'mq-only(2xl) (min-width: 1400px)';
}

// #between breakpoints
@include mq-between(sm,lg) {
  content: 'mq-between(sm,lg) (min-width: 576px) and (max-width: 1199px)';
}
```
orientationの指定を追加する場合
```css
@include mq-down(sm) {
  @include orientation(landscape) {
    content: 'mq-down(sm) and orientation(landscape) (max-width: 767px) and (orientation: portrait)';
  }
  @include orientation(portrait) {
    content: 'mq-down(sm) and orientation(portrait) (max-width: 767px) and (orientation: landscape)';
  }
}
```
