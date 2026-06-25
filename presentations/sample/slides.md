---
marp: true
theme: company
paginate: true

title: Marp プレゼンテーション入門
date: 2026-06-26

author: サンプル著者
description: Marp と GitHub Pages を使ったプレゼンテーション公開の基本を紹介するサンプルスライドです。
tags:
  - Marp
  - GitHub Pages
  - Markdown
---

<!-- _class: title -->

# Marp プレゼンテーション入門

## Markdown でスライドを作り、GitHub Pages で公開する

- サンプル著者
- 2026-06-26
- 技術勉強会

---

<!-- _class: section -->

# はじめに

## このスライドについて

---

## Marp とは

**Marp** は Markdown からプレゼンテーションスライドを生成するオープンソースツールです。

- Markdown ファイル 1 つでスライドを管理できる
- Git でバージョン管理が可能
- HTML / PDF / PPTX への出力をサポート
- カスタムテーマによるデザイン統一が可能

> 「Markdown で書けるなら、それで十分だ」

---

<!-- _class: section -->

# 基本的な使い方

---

## スライドの区切り

スライドは `---` で区切ります。

```markdown
# スライド 1

内容...

---

# スライド 2

内容...
```

各スライドは独立した `<section>` 要素として出力されます。

---

## テキストのスタイル

Markdown の標準的な記法が使えます。

- **太字** はキーワードや重要事項に
- *強調* （このテーマでは色付きで表示）はアクセントに
- `コード` はインラインコードに
- [リンク](https://marp.app) も通常通り

| 記法 | 表示 |
|------|------|
| `**太字**` | **太字** |
| `*強調*` | *強調* |
| `` `コード` `` | `コード` |

---

## コードブロック

シンタックスハイライトに対応しています。

```typescript
interface Presentation {
  title:       string;
  date:        string;
  tags:        string[];
  description?: string;
}

function buildCatalog(presentations: Presentation[]): string {
  return presentations
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(p => `<li>${p.title} (${p.date})</li>`)
    .join("\n");
}
```

---

<!-- _class: two-column -->

## 2 カラムレイアウト

**左カラム**

Marp の利点:

- シンプルな構文
- Git 管理可能
- 無料で公開できる
- テーマのカスタマイズ

**右カラム**

活用シーン:

- 社内勉強会
- 技術カンファレンス
- LT（ライトニングトーク）
- 講義資料

---

## 表の例

| ツール | 料金 | オフライン | Git 管理 |
|--------|------|-----------|---------|
| Marp | 無料 | ✅ | ✅ |
| Google スライド | 無料〜 | ❌ | ❌ |
| PowerPoint | 有料 | ✅ | △ |
| Keynote | Mac 専用 | ✅ | △ |

---

## スピーカーノート

このスライドにはスピーカーノートが付いています。

`--notes` オプションや Marp の発表者モードで確認できます。

<!-- ここがスピーカーノートです。
発表者モードでのみ表示されます。
- ポイント 1: 聴衆にゆっくり説明する
- ポイント 2: デモを見せる
-->

---

## 脚注

GitHub Pages は無料の静的サイトホスティングサービスです。[^1]

Marp CLI は npm でインストールできます。[^2]

[^1]: https://pages.github.com — パブリックリポジトリでは無料で利用可能
[^2]: `npm install -g @marp-team/marp-cli`

---

<!-- _class: section -->

# まとめ

---

## まとめ

このリポジトリでできること:

1. `presentations/<name>/slides.md` に Markdown を書く
2. `git push` するだけで自動ビルド・公開
3. カタログページが自動生成される
4. カスタムテーマでデザインを統一できる

**次のステップ:**

- `templates/presentation-template.md` をコピーして新しいプレゼンを作成
- `themes/` ディレクトリにカスタムテーマを追加

---

<!-- _class: title -->

# ご清聴ありがとうございました

## Questions?

- GitHub: https://github.com/your-org/presentations
- Marp 公式: https://marp.app
