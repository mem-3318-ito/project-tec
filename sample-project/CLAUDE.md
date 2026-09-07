# プロジェクトガイドライン

本リポジトリは静的UIの受渡用プロジェクトであり、下流での実装対象は Salesforce LWC（Lightning Web Components）です。

対象画面は15ページあり、画面ごとに複数のコンポーネントを準備する比較的大規模な構成です。

## 常に守ること

- `src` を正（ソース・オブ・トゥルース）として扱い、`dist` は自動生成物として直接編集しないこと。
- HTML / CSS / JavaScript / アクセシビリティ / 運用（Git・Husky）/ LWCハンドオフに関する詳細ルールは `.claude/rules/slds-static-ui.md` に従うこと。
- UIの作業を完了する前に、Husky（pre-push）で自動実行される `npm run check`（Lint一式 + Build）を通すこと。

## レビュー・チェックを行うとき

- SLDS / LWC移行観点でのコードレビューは `.claude/skills/lwc-review` を使用すること。
- SLDS Blueprint準拠の個別確認には `.claude/skills/slds-check` を使用すること。
