# Figma ↔ コード パリティ規約

このテンプレートには、デザイントークンとbaseコンポーネントを1:1で写したFigmaファイルがある。
Figmaでデザイン（トークン差し替え・既存コンポーネント調整・新規コンポーネント・ページレイアウト）を作り、それを元にこのテンプレートでコーディングする運用を想定している。

- テンプレート原本: `Design Tokens - astro template`（https://www.figma.com/design/ueZEmuylrYNm6NInGDYwa8）
- **実案件では原本を複製して案件用Figmaファイルを作り、そちらでデザインする**（Variables・Effect Style・コンポーネントはファイルローカルなので複製に丸ごと引き継がれ、参照も複製内で自動的に付け替わる）。案件のコーディングで読み取る対象は複製側。案件用ファイルのURLは、案件リポジトリのCLAUDE.md等に記録しておくこと（無ければユーザーに確認する。原本URLを案件の読み取りに使わない）
- 役割分担: **Figma＝仕様とトークンの真実、コード＝実装の正本**。自動同期ではなく、Claude CodeがFigmaをMCPで読み取り、このスキルの規約に沿ってAstroに反映する

## 作業開始手順：Figmaファイルの開き方（Figma関連の依頼を受けたら毎回ここから）

ユーザーから「Figma」に関する依頼（コンポーネント調整・新規作成・トークン確認・デザイン反映など）を受けたら、**まずこのmdを読み、次の手順でファイルを開いて構造を把握してから**着手する。

- 対象ファイル: `Design Tokens - astro template` / fileKey `ueZEmuylrYNm6NInGDYwa8`（案件では複製側。前述参照）
- **⚠️ `get_metadata`（nodeId無し）はトップレベルページを `Cover` の1枚しか返さないことがある**（`Foundations` / `Components` / 他ページが見えない）。これを見て「ページやコンポーネントが存在しない」と誤判断しないこと。
- **ページ／コンポーネントの確実な一覧取得は `use_figma` を使う**（`get_metadata` のページ一覧は当てにしない）:

  ```js
  // 全ページ一覧
  return figma.root.children.map(p => ({ id: p.id, name: p.name }));
  ```
  ```js
  // Components ページの全コンポーネントを名前つきで列挙
  const page = figma.root.children.find(p => p.name === 'Components');
  await figma.setCurrentPageAsync(page);
  return page.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] })
    .map(n => ({ name: n.name, id: n.id, type: n.type }));
  ```

- ページ構成: `Cover`（表紙）/ `Foundations`（トークン）/ `Components`（コンポーネント本体）。
- `Components` ページ内は **`base (Lv1)` / `features (Lv2)` / `patterns (Lv3)` / `templates (Lv4)` のセクション**に分かれ、コードの `src/components/` 階層と一致。各コンポーネントは自分のフレーム内に variant 一式（COMPONENT_SET）を持つ（例: `base (Lv1)` に Icon / Button / IconButton / Chip / Heading / Lead / Annotation / TextLink / Input / Textarea / Select / Checkbox / Radio / DescriptionItem）。
- 特定コンポーネントを読むときは、上記で得た node-id を `get_metadata` / `get_design_context` / `get_screenshot` に渡す。node-id は再作成で変わりうるので、**IDを覚え打ちせず毎回名前で引き直す**こと。

## 命名規約（Figma側・徹底必須）

コードと機械的に対応づけるための規約。ここが揃っているほど、Figma→コードの変換が無変換の写しになる。

| 対象 | ルール | 例 |
| :-- | :-- | :-- |
| コンポーネント名 | UpperCamelCase。コードのコンポーネント名（=ルートclass名）と一致させる | `Button` `IconButton` `DescriptionItem` |
| プロパティ（variant軸）名 | **実装でも切り替えて使うバリエーション**（色違い・サイズ違い等）は英語・小文字（複数語はcamelCase）。コーディング時にそのままpropsになる。既存コンポーネント調整時はコードのprop名と一致させる | `variant` `size` `shape` `iconSize` `layout` |
| プロパティ名（propにならない軸） | **Figma上の表示都合の軸**（差し込む中身・アイコンの有無・入力状態の見本など、実装ではHTMLの中身や属性で決まるもの）は日本語の説明的な名前。**デザイナーが迷ったら日本語でよい**（英語だとprops扱いと解釈されるため。コーディング時に読み替える） | `左アイコン` `内容` `マーク表示` `状態` |
| 値 | 小文字でコードの値と一致。propの無い「状態」軸の値も英語のまま | `primary` `sm` `fill` / `checked` `disabled` `placeholder` |

- プロパティ名は「camelCase固定」ではなく「**コードのprop名そのまま**」が原則。propを新設・改名したらFigma側も追従させる
- コードで表現できてFigmaで表現できない値（例: DescriptionItemの `layout=responsive` のようなレスポンシブ挙動）は、Figmaには持たせずコード専用値とする。Figma側は静的に表現できる値のみ

## Figmaでの作り方（コーディング精度に直結）

1. **色・余白・角丸・フォントサイズはVariablesにバインドして使う**。影はEffect Style（`shadow/xs`〜`2xl`）。生値で塗るとコード化時に近いトークンへの「寄せ」判断が入る
2. **既存base相当のUIは、Figma側でもそのコンポーネントのインスタンスで組む**（見出し=Heading、ボタン=Button、ラベル=Chip 等）。コード側も同じbaseをimportして組める
3. **繰り返すUI（カード等）はFigmaでもコンポーネント化してインスタンス配置**。「再利用パーツである」という意図が伝わり、コード側でも1コンポーネントに切り出される
4. **PC/SPの2フレームを用意する**。Variablesの「Responsive」コレクションのモード（PC/SP）をフレームに設定すればワンボタンでSP値（フォントmin・spacing等）に切り替わる。SPフレームが無い場合、SP挙動はテンプレート既定で実装される
5. コンポーネントの配置セクションもコードの階層に合わせる（`base` / `features` / `patterns` / `templates`）。**各分類の説明文の正本はリポジトリの `README.md`（コンポーネント構造の項）**。Figma READMEページ・SKILL.md・ここの記述はすべてこの `README.md` に揃える（ブレ厳禁）。分類の運用ルール:
   - **この4分類に置く＝コーディング時にコンポーネントとして切り出す対象**。1 Figmaコンポーネント ≈ 1 コードコンポーネントの意思表示。
   - **Figma専用パーツはこの4分類に入れない**（差し込み見本・整理用フレームなど、Figmaで組み立てやすい“デザイン側の粒度”の部品。Figmaのパーツ粒度とマークアップの分類は必ずしも一致しない）。`Components`ページ先頭の「Figma専用コンポーネント」セクションに置く＝**積極的に使ってよい作業領域**（例外・隔離ではない。詳細説明はFigma READMEページ）。**4分類へ移すことは必須ではない**（Figma専用のまま使い続けてよい）。一方で、とりあえずここに作って後から「コードでも部品化したい」ものを4分類へ整理していく使い方もOK（＝どちらも有効。全部を必ず4分類へ振り分ける、ではない）。「4分類の中＝コードで1コンポーネントとして実装する」を成立させるための切り分け。
   - **粒度は完全一致しない**: Figmaの部品粒度＝マークアップ粒度ではない（分類は「コードで部品化したい単位」の目安）。逆にレイアウト/a11y用にコードにだけ存在しFigma化しない部品（List / ButtonWrap / SkipLink 等）もある。

## トークン対応表

| Figma | コード |
| :-- | :-- |
| Color コレクション | `--color-*` |
| Responsive コレクション font/* | `--text-*`（PCモード=max、SPモード=min） |
| Responsive コレクション spacing/* | `--spacing-*`（同上） |
| Responsive コレクション layout/* | `--width-*` `--header-height` 等 |
| Radius コレクション | `--rounded-*` |
| Effect Style shadow/* | `--shadow-*`（影色はColorコレクションの `alpha/shadow-5/10/25` ↔ コードは `--color-shadow` + relative color） |
| iconSize コレクション（50〜95） | IconButtonの `iconSize` prop（cqi） |

トークンの追加・値変更はFigmaとコード（`src/styles/cssVariables.scss`）の両方に反映し、1:1を保つこと。

## コーディング依頼の受け方（Claude Code向け）

- Figmaの変更は自動検知しない。「このフレーム/コンポーネント/差分を反映して」と対象を指されたら、`get_design_context` / `get_screenshot` / `get_metadata` / `get_variable_defs` で読み取る
- 読み取った値はピクセルコピーせず、このスキルの規約（トークン・`data-*` variant・論理プロパティ・`mq-down` 等）に落とし込む
- ページレイアウトのコーディング指示では、既存base/featuresへのマッピング→無い再利用UIのコンポーネント切り出し→ページ組み立ての順で行う
