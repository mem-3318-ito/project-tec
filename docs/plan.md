# 某プロジェクトの開発面での想定可能な対応策の検討や開発方法、構成などをまとめる

## 概要

UIデザインおよび静的フロントエンドの制作（Salesforce標準デザイン（SLDS v1）を考慮）を行い、LWC化担当の別ベンダーへ引き継ぎを行う作業が主となるプロジェクト。

対象画面は15ページあり、画面ごとに複数のコンポーネントを準備する必要がある比較的大規模な構成となる。

## SLDS準拠・LWC化を前提とした構成検討

ルールの全体像は「[28. 最重要ルール](#28-最重要ルール)」、決定事項の全文は本文（1章以降）を参照。

## 1. 前提

### 作業フロー

1. SLDSを考慮した静的HTML / CSS / JavaScriptで画面またはパーツを作成する
2. 作成した画面・パーツを別ベンダーへ渡す
3. 別ベンダー側でLWC化する
4. LWC化後に表示崩れなどが発生した場合、原因を確認してCSS等を修正する

そのため、静的HTML側では単なるモック画面を作成するのではなく、

**「後工程でLWCへ変換しやすい静的コンポーネント開発環境」**

として設計する。

基本方針の全体像は「要約」を、各方針の詳細は2章以降を参照。

### 制約・前提条件

- SLDSはバージョン1（SLDS v1）を採用する
- ファイル名・ディレクトリ名の命名規則、UIコンポーネントのID属性・ラベル関連付けについては一部を公式ルールとして定める（詳細は「8-1. ファイル名・ディレクトリ名の命名規則」「11. CSSやJavaScriptで `id` に依存しない」を参照）。それ以外の命名・実装の細部はこちら側の裁量で決定する
- 画面数は15ページを想定し、画面ごとに複数のコンポーネントを準備する
- 共通コンポーネントとして扱うのは以下の4種類のみとする（それ以外は画面・機能単位のコンポーネントとして扱う）
  - ヘッダー
  - グローバルナビゲーション
  - パンくずリスト
  - 戻るボタン（ホームに戻る、[親画面名]に戻る、戻る、キャンセル）
- コード管理はBacklogのgit利用を想定しており、CIを利用できない前提で構成・運用を検討する
- Husky（pre-push）によりpush前にLint等を自動実行し、PRレビューはUI/UXや表示・動作確認を中心に行えるようにする
- アクセシビリティはWCAG 2.1 AAへの準拠を到達目標とする

---

## 2. 想定するディレクトリ構成

```text
project/
│
├─ src/
│  ├─ pages/
│  │  └─ top.html
│  │
│  ├─ components/
│  │  ├─ common/
│  │  │  ├─ header/
│  │  │  │  ├─ header.html
│  │  │  │  ├─ header.css
│  │  │  │  └─ header.js
│  │  │  │
│  │  │  ├─ global-nav/
│  │  │  │  ├─ global-nav.html
│  │  │  │  └─ global-nav.css
│  │  │  │
│  │  │  ├─ breadcrumb/
│  │  │  │  ├─ breadcrumb.html
│  │  │  │  └─ breadcrumb.css
│  │  │  │
│  │  │  └─ back-button/
│  │  │     ├─ back-button.html
│  │  │     ├─ back-button.css
│  │  │     └─ back-button.js
│  │  │
│  │  ├─ top/
│  │  │  ├─ org-name/
│  │  │  │  ├─ org-name.html
│  │  │  │  └─ org-name.css
│  │  │  │
│  │  │  ├─ invoice-summary/
│  │  │  │  ├─ invoice-summary.html
│  │  │  │  ├─ invoice-summary.css
│  │  │  │  └─ invoice-summary.js
│  │  │  │
│  │  │  ├─ active-contracts/
│  │  │  │  ├─ active-contracts.html
│  │  │  │  └─ active-contracts.css
│  │  │  │
│  │  │  └─ notifications/
│  │  │     ├─ notifications.html
│  │  │     └─ notifications.css
│  │  │
│  │  └─ ...(画面ごとに同様のディレクトリを追加。15画面分を想定)
│  │
│  ├─ styles/
│  │  ├─ base.css
│  │  └─ layout.css
│  │
│  ├─ scripts/
│  │  └─ main.js
│  │
│  └─ assets/
│
├─ scripts/
│  └─ build.mjs
│
├─ dist/
│  └─ top.html
│
├─ .husky/
│  └─ pre-push
│
├─ package.json
├─ eslint.config.js
├─ stylelint.config.js
├─ .htmlvalidate.json
└─ README.md
```

各ディレクトリの責務は以下

| ディレクトリ            | 役割                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| `src/pages`             | 画面全体の構成（15画面分）                                                                       |
| `src/components/common` | 全画面共通のパーツ（ヘッダー / グローバルナビゲーション / パンくずリスト / 戻るボタンの4種のみ） |
| `src/components/[page]` | 画面・機能単位のパーツ（検索フォーム、テーブルなど）、将来のLWC化候補                            |
| `src/styles`            | 全画面共通の最低限のスタイル                                                                     |
| `src/scripts`           | 全体共通処理                                                                                     |
| `src/assets`            | 画像などの静的リソース                                                                           |
| `scripts`               | ビルド処理                                                                                       |
| `dist`                  | 表示・動作確認用の成果物                                                                         |
| `.husky`                | pre-pushフック（push前のLint等自動実行）                                                         |

---

## 3. HTML共通化は「ビルド時Include」で行う

共通パーツを各ページへコピーして管理しない。

ページ側では、コンポーネントを参照するだけにする。

例:

```html
<!doctype html>
<html lang="ja">
  <head>
    ...
  </head>
  <body>
    <include src="../components/common/header/header.html"></include>
    <include src="../components/common/global-nav/global-nav.html"></include>

    <main class="app-main">
      <include src="../components/top/org-name/org-name.html"></include>

      <include
        src="../components/top/invoice-summary/invoice-summary.html"
      ></include>

      <include
        src="../components/top/active-contracts/active-contracts.html"
      ></include>

      <include
        src="../components/top/notifications/notifications.html"
      ></include>
    </main>
  </body>
</html>
```

ビルド時にIncludeを実際のHTMLへ展開する。

生成後の `dist/top.html` は通常の静的HTMLとなる。

```text
src/pages/top.html

        ↓ build

components/common/header/header.html
components/common/global-nav/global-nav.html
components/top/org-name/org-name.html
components/top/invoice-summary/invoice-summary.html
components/top/active-contracts/active-contracts.html
components/top/notifications/notifications.html

        ↓

dist/top.html
```

なお、検索フォームとテーブルのように、コンポーネントを跨いだ連携が必要になるケースについては「12-1. コンポーネントを跨ぐ処理（検索 → テーブル連携）への対応」を参照。

ビルドツールとしては、PostHTML + posthtml-includeなどの軽量な仕組みを利用する。

重要なのは、テンプレートエンジンを複雑化しないこと。

推奨:

```text
include
```

原則避ける:

```text
複雑なif
for
独自関数
独自マクロ
複雑なテンプレート変数
```

ビルド処理は、

**「HTMLを結合するための薄いレイヤー」**

に留めることを意識する。

---

## 4. `src` を正とし、`dist` は生成物とする

開発者が直接修正するのは必ず `src` 配下とする。

以下は禁止。

```text
dist/top.html
        ↓
直接修正
```

正しい流れは以下。

```text
src/components/top/invoice-summary/invoice-summary.css
        ↓
修正
        ↓
npm run build
        ↓
dist/top.html
```

つまり、

```text
src = LWC化するための情報を含む正しい情報
dist = あくまで、開発時に表示確認するための成果物
```

とします。

---

## 5. コンポーネント境界を将来のLWC境界に合わせる

単にheaderやfooterだけを共通化するのではなく、

**将来的にLWCになる可能性が高いUI単位**

でコンポーネント化します。

ただし、全画面で共通利用する「共通コンポーネント」は以下の4種類のみとする。

```text
components/common/
├─ header/
├─ global-nav/
├─ breadcrumb/
└─ back-button/
```

これ以外のUI単位（検索フォーム、テーブル、ページネーション、モーダルなど）は、15画面それぞれの仕様に応じて画面・機能単位のコンポーネントとして用意する。全画面で共有する想定はせず、必要な画面ごとに個別実装する。

```text
components/user-list/
├─ search-form/
├─ result-table/
└─ pagination/

components/user-detail/
├─ tab-panel/
└─ ...

（画面ごとに必要なコンポーネントを個別に用意）
```

例えば静的実装を、

```text
components/user-list/search-form/
├─ search-form.html
├─ search-form.css
└─ search-form.js
```

としておけば、LWC化する際に、

```text
searchForm/
├─ searchForm.html
├─ searchForm.css
├─ searchForm.js
└─ searchForm.js-meta.xml
```

という対応関係を作りやすい。

理想は、

```text
Static Component A

        ↓

LWC Component A
```

という1対1に近い変換ができること。

---

## 6. SLDS v1 Blueprintを静的HTMLの基準とする

静的HTMLでは、SLDS v1に準拠したカスタムコンポーネントを構築するための設計図（Blueprint）を基本とする。SLDS 2系との差異（トークン、クラス名、コンポーネント構造など）がある場合は、必ずSLDS v1側の仕様に合わせる。

例えばボタンは以下のように実装する。

```html
<button class="slds-button slds-button_brand" type="button">保存</button>
```

LWC化する際は、LWC担当者が必要に応じてLightning Base Componentsへ置き換える。

例:

```html
<lightning-button label="保存" variant="brand"></lightning-button>
```

つまり役割分担は以下とする。

```text
静的HTML工程
    ↓
SLDS Blueprint準拠

LWC工程
    ↓
Lightning Base Components優先
    ↓
必要に応じてSLDS
```

静的HTML側でLWCそのものを再現しようとしない。

---

## 7. SLDSクラスを独自CSSで直接上書きしない

以下のようなSLDSクラス自体への上書きは原則禁止とする。

NG:

```css
.slds-button {
  border-radius: 10px;
}

.slds-input {
  height: 50px;
}
```

プロジェクト独自のクラスを追加する。

OK:

```html
<section class="app-search-form">
  <button
    class="slds-button slds-button_brand app-search-form__submit"
    type="button"
  >
    検索
  </button>
</section>
```

```css
.app-search-form {
  /* 独自レイアウト */
}

.app-search-form__submit {
  /* 必要な場合のみ独自スタイル */
}
```

責務を以下のように分離する。

```text
slds-*
    ↓
Salesforce / SLDS側の責務

app-*
    ↓
プロジェクト独自実装
```

---

## 8. CSSはコンポーネント単位で閉じる

静的HTMLではLWCのようなCSSスコープがないため、命名規則によってコンポーネント間の影響を防止する。

以下のような汎用的すぎるクラスは避ける。

NG:

```css
.title {
}

.button {
}

.container {
}
```

コンポーネント名を含める。

OK:

```css
.app-search-form {
}

.app-search-form__title {
}

.app-search-form__field {
}

.app-search-form__actions {
}

.app-search-form__button {
}
```

命名規則として、

```text
app-{component}
app-{component}__{element}
```

程度の軽いBEM形式を推奨する。

例:

```text
app-result-table
app-result-table__header
app-result-table__row
app-result-table__actions
```

---

## 8-1. ファイル名・ディレクトリ名の命名規則

HTMLファイル名・ディレクトリ名には以下のルールを適用する（プロジェクトの公式ルールとして確定済み）。

- 半角英小文字・数字・ハイフン（`-`）/アンダースコア（`_`）のみを使用する
- 単語区切りが必要な場合は日本語のローマ字表記を避け、英語またはローマ字ではなく英語表現を使用する

OK:

```text
search-form.html
result-table.css
active-contracts/
```

NG:

```text
KensakuForm.html
検索フォーム.html
Search_Form.HTML
```

これ以外のCSSクラス命名（BEM形式など、「8. CSSはコンポーネント単位で閉じる」を参照）やディレクトリ構成の細部については、本プロジェクトの裁量で決定してよい。

---

## 9. Global CSSを最小限にする

`common.css` にすべてのスタイルを追加する運用は避ける。

推奨:

```text
styles/
├─ base.css
└─ layout.css
```

Global CSSへ置くのは、

- HTML全体に適用するもの
- アプリケーション全体の基本レイアウト
- 本当に複数コンポーネントで共有すべきもの

程度に留める。

基本的なスタイルは、

```text
components/search-form/search-form.css
components/result-table/result-table.css
components/pagination/pagination.css
```

のようにコンポーネント側へ配置する。

---

## 10. ページ固有CSSを増やしすぎない

例えば、

```text
pages/user-list.css
pages/user-detail.css
pages/user-edit.css
```

へ大量のスタイルを書かない。

コンポーネント固有の見た目はコンポーネントCSSへ配置する。

ページ側CSSが担当するのは主に、

- コンポーネント同士の配置
- ページ全体のGrid
- ページ固有の余白

などとする。

---

## 11. CSSやJavaScriptで `id` に依存しない

LWC化を考慮し、`id` をCSSセレクタやJavaScriptの主要な識別方法として使用しない。

NG:

```css
#searchButton {
}
```

```js
document.querySelector("#searchButton");
```

CSSではclassを使用する。

```css
.app-search-form__button {
}
```

JavaScriptでは `data-*` 属性を利用する。

```html
<button
  class="slds-button slds-button_brand"
  data-action="search"
  type="button"
>
  検索
</button>
```

```js
component.querySelector('[data-action="search"]');
```

なお、`id` 自体をHTMLから完全に禁止する必要はない。

アクセシビリティ用途など、

```text
label → input
aria-describedby
aria-labelledby
```

で必要な場合は使用してよい。

### UIコンポーネントにおけるID属性・ラベル関連付けのルール（公式ルール）

以下はプロジェクトの公式ルールとして確定済みとする。

- プログラムで解釈可能な識別子と役割を提供すること（`label` の `for` 属性と `input` の `id` を一致させる）
- 同一ページ内で `id` を重複させない

OK:

```html
<label for="user-name">氏名</label>
<input id="user-name" type="text" name="user-name" />
```

NG:

```html
<label for="name">氏名</label>
<input id="user_name" type="text" name="user-name" />
```

---

## 12. JavaScriptもコンポーネント境界を意識する

JavaScriptがページ全体のDOMを自由に操作する構造は避ける。

コンポーネントのルートを定義する。

```html
<section class="app-search-form" data-component="search-form">
  ...

  <button
    class="slds-button slds-button_brand"
    data-action="search"
    type="button"
  >
    検索
  </button>
</section>
```

JavaScriptでは、まずコンポーネントを取得する。

```js
const components = document.querySelectorAll('[data-component="search-form"]');

components.forEach((component) => {
  const searchButton = component.querySelector('[data-action="search"]');

  searchButton?.addEventListener("click", () => {
    // prototype用処理
  });
});
```

考え方は以下。

```text
document
   ↓
Component取得
   ↓
Component内部だけを操作
```

これにより、LWC化した際にJavaScriptの責務を移行しやすくなる。

---

## 12-1. コンポーネントを跨ぐ処理（検索 → テーブル連携）への対応

検索フォームとテーブル（ページネーション付き）は別コンポーネントとして分割するが、検索を実行するとテーブルの表示内容が変化するような、コンポーネントを跨ぐ処理が発生する画面がある。

各コンポーネントが互いのDOMを直接操作する実装は避ける。

NG:

```js
// search-formコンポーネントがresult-tableの内部を直接書き換える
searchButton.addEventListener("click", () => {
  document.querySelector('[data-component="result-table"] tbody').innerHTML =
    "...";
});
```

代わりに、以下いずれかの方式でページ側（または上位コンポーネント）が仲介する構成とする。

1. **カスタムイベント経由**: 子コンポーネントは自身の状態変化を`CustomEvent`として発火するだけに留め、DOM操作は行わない。ページ側（`data-page`のルート、もしくは`main.js`）がイベントを購読し、テーブル側コンポーネントへ結果を渡す。

```js
// search-form側: 検索条件をイベントとして発火するだけ
searchFormRoot.dispatchEvent(
  new CustomEvent("app:search", {
    bubbles: true,
    detail: { keyword },
  }),
);
```

```js
// ページ側: イベントを受けてテーブル側コンポーネントを更新する
pageRoot.addEventListener("app:search", (event) => {
  const tableComponent = pageRoot.querySelector(
    '[data-component="result-table"]',
  );
  tableComponent?.dispatchEvent(
    new CustomEvent("app:update-rows", { detail: event.detail }),
  );
});
```

2. **ページ側の共有状態**: 画面固有の`main.js`（またはページスクリプト）が検索条件・結果データを保持し、各コンポーネントへ「渡す」形にする。コンポーネント同士が直接参照し合わない。

考え方は以下。

```text
search-form
   ↓ CustomEvent発火のみ
ページ（仲介役）
   ↓ 必要なコンポーネントへイベント/データを伝搬
result-table
```

この方式であれば、LWC化した際も

```text
search-form → (event) → 親コンポーネント/ページ → (property/event) → result-table
```

という構造にそのまま置き換えやすい。LWCの`CustomEvent` + 親子間のプロパティ受け渡しと対応関係を作っておくことが目的であり、静的HTML側で状態管理ライブラリなどを持ち込む必要はない（「26. 静的工程でやりすぎない」を参照）。

---

## 13. inline CSS / inline JavaScriptを避ける

以下は原則禁止。

NG:

```html
<button onclick="search()">検索</button>
```

NG:

```html
<div style="margin-top: 16px"></div>
```

以下のようにHTML、CSS、JavaScriptを分離する。

```html
<button class="app-search-form__button" data-action="search">検索</button>
```

```css
.app-search-form__button {
  margin-top: 1rem;
}
```

```js
searchButton.addEventListener('click', () => {
  ...
});
```

---

## 14. JavaScriptは画面再現に必要な最低限だけ実装する

静的HTML工程では、LWCのビジネスロジックまで先行実装しない。

実装範囲は「ユーザー操作に伴う表示状態・画面状態」とし、API連携やSalesforceデータ取得に関連しないフロント部分は全て対応する。画面設計書に明示されていない表現も含め、以下は対応する。

表示全般の例:

```text
セクション切り替え
Accordion
プルダウンメニューの開閉
入力値に応じた表示切替
ボタンの活性/非活性
エラー表示
完了メッセージ（必要があれば）
検索条件の保持
検索後の結果表示状態
0件表示
ページネーション
ソート表示
```

その他対応するもの:

```text
UI上不要な簡易バリデーション
API結果を想定した各種表示パターンの再現
（ただしデータ形式の確認などSB側との連携が必要になることもある）
```

原則として静的工程では実装しない（LWCのビジネスロジックとしての実装範囲）もの:

```text
API連携
Salesforceデータ取得が必要な範囲（DB系）
```

必要なデータはモックでよい。

```js
const mockUsers = [
  {
    id: "001",
    name: "山田太郎",
  },
  {
    id: "002",
    name: "鈴木花子",
  },
];
```

静的工程の目的は、

**「UI仕様とUI操作仕様を確認可能にすること」**

とする。

---

## 15. アクセシビリティを静的段階から考慮する

WCAG 2.1 AAへの準拠を到達目標とする。見た目だけ合わせるのではなく、HTMLの意味構造も正しくする。

NG:

```html
<div onclick="save()">保存</div>
```

OK:

```html
<button type="button">保存</button>
```

最低限確認する項目:

- Semantic HTML
- button / a の適切な使い分け
- form
- label
- heading階層
- aria-\* 属性
- キーボード操作
- focus状態
- エラー表示
- 必須項目表現
- モーダルのフォーカス制御
- タブ操作

SLDS Blueprintにアクセシビリティ要件が記載されている場合は、それも実装する。WCAG 2.1 AAの達成基準を満たしているかを最終確認の観点とする。

---

## 16. Includeのネストを深くしすぎない

以下のような深い依存関係は避ける。

```text
Page
 ↓
Component A
 ↓
Component B
 ↓
Component C
 ↓
Component D
```

基本は以下。

```text
Page
 ├ Component A
 ├ Component B
 ├ Component C
 └ Component D
```

必要な場合のみ、

```text
Page
 └ Component A
      └ Small Component
```

程度とする。

目安として、Includeは2階層程度に留める。

静的HTMLを確認した際に、そのままLWC構造を想像できることを重視する。

---

## 17. HTML / CSS / JavaScriptのLintを導入する

人間レビューやAIレビューだけに依存せず、機械的チェックを導入する。

推奨ツール:

```text
HTML
  ↓
html-validate

CSS
  ↓
Stylelint

JavaScript
  ↓
ESLint

Format
  ↓
Prettier
```

package.jsonの例:

```json
{
  "scripts": {
    "dev": "...",
    "build": "node scripts/build.mjs",

    "lint:html": "html-validate \"src/**/*.html\"",
    "lint:css": "stylelint \"src/**/*.css\"",
    "lint:js": "eslint \"src/**/*.js\"",

    "lint": "npm run lint:html && npm run lint:css && npm run lint:js",

    "check": "npm run lint && npm run build",

    "prepare": "husky"
  }
}
```

コード管理にBacklogのgitを利用しCIが利用できない前提のため、Huskyの`pre-push`フックで`npm run check`を強制実行し、Lint未通過のコードがpushされないようにする。

`.husky/pre-push`の例:

```bash
#!/usr/bin/env sh
npm run check
```

---

## 18. Claude CodeはLintで判断できない部分をレビューする

Claude Codeでは、単純な文法チェックではなく、設計・SLDS・LWC移行観点をレビューする。

主なレビュー項目:

```text
SLDS Blueprintに準拠しているか

SLDSに存在する表現を独自CSSで再実装していないか

SLDSクラスを直接overrideしていないか

独自CSSが必要最小限か

コンポーネント境界が適切か

将来LWC化しやすいDOM構造か

JavaScriptがコンポーネント境界を越えていないか

id依存になっていないか

inline CSS / inline JSがないか

アクセシビリティ要件（WCAG 2.1 AA）を満たしているか

不要なHTML階層がないか

Includeが過剰にネストされていないか

Lightning Base Componentへ置き換えやすい構造か

共通コンポーネント（ヘッダー / グローバルナビゲーション / パンくずリスト / 戻るボタン）以外を安易に共通化していないか

コンポーネントを跨ぐ処理をカスタムイベント経由でページ側に仲介させているか（コンポーネント同士が直接DOM操作していないか）
```

これらを `CLAUDE.md`、rules、skillsなどへ定義しておく。

---

## 19. 開発・レビューフロー

コード管理はBacklogのgitを想定しており、CIは利用できない前提とする。そのため、CIでの機械的チェックの代わりに、Husky（pre-push）によるローカルでの自動チェックを必須の防波堤とする。

開発者のローカル作業からPRレビューまでの一連の流れは以下とする。

```text
実装
 ↓
Prettier
 ↓
HTML Validate / Stylelint / ESLint
 ↓
Claude CodeによるSLDS / LWC観点レビュー
 ↓
npm run build
 ↓
dist表示確認
 ↓
git push
 ↓
Husky (pre-push) → npm run check（lint + build）
 ↓
（Lintエラーがあればpush自体が失敗する）
 ↓
Pull Request作成
 ↓
Claude CodeによるAI Review（SLDS / LWC移行観点）
 ↓
人間によるReview
```

```bash
npm run check
```

だけで、

```text
lint
+
build
```

まで実行できるようにする。`git push`時にはHusky（pre-push）が`npm run check`を自動実行するため、Lintエラーが残ったままの状態ではpushできない。開発者が手動でチェックを忘れた場合でも、機械的な問題がリモートに渡らないようにする。

Husky（pre-push）を通過したコードのみがリモートへpushされるため、Lintで検出できる機械的な問題は原則PRに持ち込まれない。したがって人間のPRレビューは、

- UI仕様
- 表示・見た目（デザイン差分）
- 実際の動作（操作性）
- コンポーネント設計
- 業務要件
- SLDSの適切性
- LWC化した際の構造

など、Lintでは判断できないUI/UXや設計面の観点に集中する。

万一CIが利用可能な環境が用意できた場合は、Husky pre-pushと同内容のチェック（`npm run check`）をCI上でも実行し、二重の防波堤とする。

---

## 20. ローカル開発環境は `npm run dev` で起動可能にする

新規参画者が、

```bash
npm install
npm run dev
```

だけで開発できる状態を目指す。`npm install`時に`prepare`スクリプト経由でHuskyのgit hookが自動セットアップされるため、追加の手動設定は不要とする。

`npm run dev` では、

```text
静的HTTPサーバー

+

HTML / CSS / JavaScript変更監視

+

Include自動Build

+

必要であればBrowser Reload
```

を実行する。

主なコマンド例:

```text
npm run dev
    開発サーバー + watch

npm run build
    dist生成

npm run lint
    HTML / CSS / JavaScriptチェック

npm run check
    lint + build

npm run format
    Prettier

npm run review
    Claude Codeによるレビュー
```

---

## 21. LWC担当ベンダーへ `dist` だけを渡さない

LWC化担当ベンダーには、生成されたHTMLだけではなくソース構造も渡す。

推奨成果物:

```text
src/
├─ pages/
├─ components/
├─ styles/
├─ scripts/
└─ assets/

dist/

README.md
```

役割:

| 成果物           | 用途                      |
| ---------------- | ------------------------- |
| `src/pages`      | ページ構成の確認          |
| `src/components` | LWC化する元コンポーネント |
| `src/styles`     | 共通スタイル              |
| `src/scripts`    | UI操作仕様                |
| `dist`           | 完成状態の画面確認        |
| `README.md`      | 実装ルール・変換方針      |

---

## 22. Static ComponentとLWCの対応表を用意する

READMEなどに対応表を作る。

例:

| Static Component | LWC想定          |
| ---------------- | ---------------- |
| `header`         | `c-header`       |
| `breadcrumb`     | `c-breadcrumb`   |
| `search-form`    | `c-search-form`  |
| `result-table`   | `c-result-table` |
| `pagination`     | `c-pagination`   |

イメージ:

```text
components/search-form
        ↓
LWC
        ↓
c-search-form
```

これにより別ベンダーがコンポーネント境界を再設計する負荷を減らす。

---

## 23. LWC化後の表示崩れ修正ルールを決めておく

LWC化後に表示差分が発生した場合、単純に静的CSSを修正するのではなく、原因を切り分ける。

確認する順番:

```text
1. 静的HTML側の実装ミスか

2. LWC変換時の実装ミスか

3. Shadow DOM / CSSスコープによる差か

4. Lightning Base Componentによる差か

5. Salesforce実行環境固有の差か
```

役割としては、

```text
静的HTML
    ↓
デザイン / UI仕様の基準

LWC
    ↓
最終実装
```

とする。

LWC側に表示崩れがあった場合、

```text
LWCが崩れている
    ↓
静的CSSを即修正
```

とはしない。

例えば、

```text
静的HTML実装ミス
    ↓
静的側を修正
    ↓
LWCにも反映

LWC変換ミス
    ↓
LWC側を修正

Shadow DOM等の差
    ↓
LWC側で調整
```

とする。

---

## 24. iframeは共通化用途として使用しない

headerやfooter等の共通化にiframeは利用しない。

理由:

- DOMが別Documentになる
- CSSが分離される
- イベント伝播が異なる
- 高さ調整が必要になる
- レスポンシブ確認が複雑になる
- LWCのコンポーネント構造と異なる
- LWC化後の表示差分が増える

したがって、

```text
iframe
```

ではなく、

```text
HTML Component
       ↓
Build Include
       ↓
通常のHTML
```

とする。

---

## 25. Native Web Componentsも原則として導入しない

Native Web Componentsを利用すると、

```html
<app-header></app-header>
```

のような実装も可能だが、本プロジェクトでは原則として採用しない。

理由:

- 最終成果物はLWCである
- Native Web ComponentsとLWCは同じではない
- 静的工程とLWC工程で二重にコンポーネント実装することになる
- Shadow DOM等の差異が新たに発生する

静的工程では、

```text
HTML Fragment
+
CSS
+
JavaScript
```

程度に留める。

---

## 26. 静的工程でやりすぎない

静的環境を便利にしすぎて、

```text
独自テンプレートエンジン
独自Component Framework
複雑な状態管理
SPA Router
仮想DOM
独自UI Library
```

などを作らない。

今回の静的環境は、

**最終成果物ではない。**

あくまで、

```text
SLDS Blueprint
       ↓
Static UI Component
       ↓
LWC
```

という工程の中間成果物である。

そのため、

**「LWC化しやすいこと」**

を技術選定の最優先事項とする。

---

## 27. 推奨アーキテクチャ

全体像は以下。

```text
               SLDS Blueprint
                      │
                      ↓
         ┌──────────────────────┐
         │  Static UI Project   │
         │                      │
         │ pages                │
         │   └ 画面構成          │
         │                      │
         │ components           │
         │   ├ header           │
         │   ├ search-form      │
         │   ├ result-table     │
         │   └ pagination       │
         │                      │
         │ styles               │
         │ scripts              │
         └──────────┬───────────┘
                    │
                    │ Build Include
                    ↓
             ┌─────────────┐
             │    dist     │
             │             │
             │ 完成静的HTML │
             └──────┬──────┘
                    │
                    ↓
               表示・動作確認
                    │
                    ↓
            別ベンダーへ引渡し
                    │
                    ↓
         ┌──────────────────────┐
         │         LWC          │
         │                      │
         │ header               │
         │   → c-header         │
         │                      │
         │ search-form          │
         │   → c-search-form    │
         │                      │
         │ result-table         │
         │   → c-result-table   │
         │                      │
         │ pagination           │
         │   → c-pagination     │
         └──────────┬───────────┘
                    │
                    ↓
                表示差分確認
                    │
                    ↓
                 CSS調整
```

---

## 28. 最重要ルール

本プロジェクトで特に重要なルールをまとめる。

1. HTMLの共通化はビルド時Includeで行う
2. `src` を正とし、`dist` は生成物とする
3. `dist` を直接編集しない
4. Component境界は将来のLWC境界を意識する
5. SLDS v1 Blueprintを静的HTML実装の基準にする
6. LWC化後はLightning Base Componentsを優先する
7. SLDSクラスを独自CSSで直接overrideしない
8. 独自CSSはComponent単位で閉じる
9. Global CSSを増やしすぎない
10. page固有CSSを増やしすぎない
11. CSS / JavaScriptで `id` に依存しない
12. JavaScriptはComponent内部だけを操作する
13. inline CSS / inline JavaScriptを使用しない
14. JavaScriptはUI再現に必要な最低限にする
15. アクセシビリティはWCAG 2.1 AAへの準拠を到達目標とし、静的段階から考慮する
16. Includeのネストを深くしすぎない
17. HTML Validate / Stylelint / ESLint / Prettierを導入する
18. Claude CodeでSLDS / LWC移行観点をレビューする
19. Backlogのgit運用でCIが使えない前提とし、Husky（pre-push）でLintとBuildを自動実行する
20. `dist` だけでなく `src/components` もLWC担当へ渡す
21. Static ComponentとLWCの対応表を用意する
22. LWC化後の表示崩れは原因を切り分けて修正する
23. iframeを共通化用途として使わない
24. Native Web Componentsを無理に導入しない
25. 静的環境を独自フレームワーク化しない
26. 共通コンポーネントはヘッダー / グローバルナビゲーション / パンくずリスト / 戻るボタンの4種のみとする
27. 検索とテーブルなど、コンポーネントを跨ぐ処理はカスタムイベント経由でページ側が仲介する
28. 15画面規模を前提に、画面・機能単位のコンポーネントは無理に共通化しない
29. ファイル名・ディレクトリ名は半角英小文字・数字・ハイフン/アンダースコアのみを使用する
30. `label` の `for` と `input` の `id` を一致させ、`id` はページ内で重複させない

---

## 29. 最終方針

今回の開発では、

```text
静的HTMLを完成品として作る
```

のではなく、「27. 推奨アーキテクチャ」の全体像に沿って、SLDS Blueprintから始まりLWC化までを見据えた中間成果物として静的UIを作る。そのため、ビルド環境は可能な限り薄く保つ（3章「HTML共通化は『ビルド時Include』で行う」を参照）。

この方式により、

- フレームワーク依存を避けられる
- Component単位でLWCへ移行しやすい
- SLDSレビューをComponent単位で実施できる
- 別ベンダーとの責任分界が明確になる
- LWC化後の表示差分を追跡しやすい

というメリットを得られる。

したがって本プロジェクトでは、

**「SLDS Blueprint準拠 + Component単位管理 + Build時HTML Include + LWC境界を意識したCSS / JavaScript設計」**

を基本方針とする。個別ルールの全文は「28. 最重要ルール」を参照。
