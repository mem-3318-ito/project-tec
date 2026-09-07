---
name: slds-check
description: SLDS v1 Blueprintへの準拠を個別に確認する。カスタムCSSの必要性、.slds-*クラスの直接上書き、ユーティリティクラスの優先利用などSLDS固有の観点を深掘りしたいときに使う。
---

# SLDS Blueprint準拠チェック

対象コンポーネントがSLDS v1 Blueprintに準拠しているかを確認する。

## 確認手順

1. 対象コンポーネントに対応するSLDS v1 Blueprintのマークアップ・クラス構成を確認する。
2. 実装のHTML構造・クラス名がBlueprintと一致しているか比較する。
3. SLDSユーティリティクラスで表現可能な見た目を、独自CSSで再実装していないか確認する。
4. `.slds-*` クラスを独自CSSで直接上書きしていないか確認する（`app-{component}` / `app-{component}__{element}` などプロジェクト独自クラスで対応できているか）。
5. 独自CSSが必要最小限か（本当にSLDSでは表現できない部分のみか）を確認する。
6. SLDS v1 Blueprintにアクセシビリティ要件の記載がある場合、それも満たしているか確認する。

## NGパターン

```css
.slds-button {
  border-radius: 10px;
}
```

- SLDSに存在するコンポーネント表現（Accordion、Modalなど）を独自CSS / JavaScriptで再実装している
- Blueprintに存在しない独自のDOM構造を、SLDSクラス名のまま拡張している

各項目の判断基準・実装ルールの詳細は `.claude/rules/slds-static-ui.md` を参照。
