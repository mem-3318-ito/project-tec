# SLDS準拠した静的UI → LWC化のサンプルプロジェクト

フレームワークやSSGを使用せず、SLDSを考慮した静的HTML / CSS / JavaScriptをコンポーネント単位で作成し、別ベンダーへLWC化の元ソースとして引き渡すための最小サンプルです。

## 方針

- `src` が Source of Truth。
- `dist` はビルド生成物。直接編集しない。
- HTML共通化はPostHTMLの `<include>` だけを利用する。
- テンプレート変数、条件分岐、ループなどは導入しない。
- `src/components/*` を将来のLWC候補として扱う。
- SLDS Blueprint / utility classesを優先し、独自CSSは必要最小限にする。
- `.slds-*` セレクタを独自CSSから直接overrideしない。
- JavaScriptは `data-component` を起点にコンポーネント内部だけを操作する。
- `id` はlabelやARIAなどアクセシビリティ用途では利用可能だが、CSS / JSの識別には利用しない。
- iframe、inline style、inline event handlerは利用しない。

## 必要環境

- Node.js 22.16以上
- npm

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:4173` を開くと `user-list.html` が表示されます。

初回 `npm install` で生成された `package-lock.json` はGitへコミットし、実案件ではCIを `npm ci` に切り替えて依存バージョンを固定することを推奨します。

## SLDSバージョン

このサンプルは `@salesforce-ux/design-system` 2.264.0（SLDS 1）を固定して利用します。対象Salesforce環境でSLDS 2 / Cosmosを採用する場合は、静的側だけ先行して混在させず、LWC側の対象デザインシステムと合わせて依存・Blueprint・レビュー基準を切り替えてください。

## コマンド

```bash
npm run dev          # build + src監視 + 開発用HTTPサーバー
npm run build        # dist生成
npm run lint         # HTML / CSS / JS / Project rules
npm run format       # Prettier
npm run format:check # フォーマット確認
npm run check        # format:check + lint + build
```

## ディレクトリ

```text
project/
├─ src/
│  ├─ pages/              # ページ構成
│  ├─ components/         # LWC候補
│  ├─ styles/             # 全体共通の最低限のCSS
│  └─ scripts/            # ページレベルのJS
├─ scripts/               # build / dev / project rule check
├─ dist/                  # 自動生成
└─ .claude/rules/         # Claude Codeレビュー基準
```

## Include例

ページでは以下のようにコンポーネントを組み合わせます。

```html
<include src="components/header/header.html"></include>
<include src="components/search-form/search-form.html"></include>
<include src="components/result-table/result-table.html"></include>
```

`npm run build` を実行すると、IncludeされたHTMLが通常のHTMLへ展開されます。

さらに、IncludeしたHTMLと同じディレクトリに同名のCSS / JSが存在する場合、ビルド時にページへ自動で読み込みタグを追加します。

```text
components/search-form/
├─ search-form.html
├─ search-form.css  → 自動でlink追加
└─ search-form.js   → 自動でscript追加
```

この仕組みにより、ページ側が各コンポーネントのCSS / JS依存を知る必要をなくしています。

## Static Component → LWC対応イメージ

| Static Component | LWC候補            |
| ---------------- | ------------------ |
| `header`         | `c-header`         |
| `search-form`    | `c-search-form`    |
| `result-table`   | `c-result-table`   |
| `pagination`     | `c-pagination`     |
| `user-detail`    | `c-user-detail`    |
| `user-edit-form` | `c-user-edit-form` |

LWC化時は静的HTMLを機械的にそのまま移すのではなく、利用可能な箇所はLightning Base Componentsへの置き換えを検討します。

## CSSルール

NG:

```css
.slds-button {
  border-radius: 10px;
}
```

OK:

```css
.app-search-form__actions {
  display: flex;
  justify-content: flex-end;
}
```

コンポーネント固有CSSは、そのコンポーネントのディレクトリに置きます。

## JavaScriptルール

NG:

```js
document.getElementById("search-button");
```

OK:

```js
const components = document.querySelectorAll('[data-component="search-form"]');

components.forEach((component) => {
  const button = component.querySelector('[data-action="search"]');
});
```

ページ間・コンポーネント間の調停が必要になった場合のみ `src/scripts/main.js` へ寄せます。

## Project Rules Check

`npm run lint:project` は以下を機械的に検出します。

- inline style
- inline event handler
- iframe
- 独自CSSからの `.slds-*` selector override
- CSS ID selector
- `getElementById`
- `querySelector("#...")`

Lintで検出できないSLDS Blueprintの妥当性、LWC移行性、アクセシビリティなどはClaude Code / 人間レビューで確認します。

## LWC化後に表示差分が出た場合

以下の順序で原因を切り分けます。

1. 静的HTML側の実装ミス
2. LWC変換時の実装ミス
3. Shadow DOM / CSSスコープ差
4. Lightning Base Componentとの差
5. Salesforce環境固有差

静的版が崩れている場合のみ静的ソースを修正し、LWC固有差分は原則としてLWC側で調整します。

## ベンダーへ渡すもの

基本的には以下をセットで渡します。

```text
src/
dist/
README.md
```

- `src/pages`: ページ構成の設計図
- `src/components`: LWC化の元
- `dist`: 完成状態の表示確認
- `README.md`: 実装・変換ルール

`dist` だけを引き渡さないことがポイントです。
