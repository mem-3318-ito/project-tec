---
name: slds-check
description: SLDS v1を部分的に利用している箇所がBlueprintに準拠しているか、また基本方針（カスタムCSS）に反して不要にSLDSを利用していないかを確認する。
---

# SLDS v1利用箇所の確認

本プロジェクトのデザインは基本的にカスタムCSSで実装し、SLDS v1は必要な場合にのみ部分的に利用する方針である。対象コンポーネントがこの方針に沿っているかを確認する。

## 確認手順

1. 対象コンポーネントがSLDS v1を利用する必要がある箇所かどうかを確認する（基本方針はカスタムCSSであり、SLDS利用は例外であることを踏まえる）。
2. SLDS v1を利用している場合、対応するSLDS v1 Blueprintのマークアップ・クラス構成を確認する。
3. 実装のHTML構造・クラス名がBlueprintと一致しているか比較する。
4. `.slds-*` クラスを独自CSSで直接上書きしていないか確認する（`app-{component}` / `app-{component}__{element}` などプロジェクト独自クラスで対応できているか）。
5. SLDS v1 Blueprintにアクセシビリティ要件の記載がある場合、それも満たしているか確認する。
6. SLDSを利用する必然性が薄い箇所で、安易に `.slds-*` クラスが使われていないか（基本方針のカスタムCSSに寄せられないか）確認する。

## NGパターン

```css
.slds-button {
  border-radius: 10px;
}
```

- SLDS v1を利用する理由がないにもかかわらず `.slds-*` クラスを使用している
- Blueprintに存在しない独自のDOM構造を、SLDSクラス名のまま拡張している

各項目の判断基準・実装ルールの詳細は `.claude/rules/slds-static-ui.md` を参照。
