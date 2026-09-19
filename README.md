# CodeMirror Markdown Editor

CodeMirror 6を試すための、シンプルなMarkdownエディタです。

## Demo

GitHub Pages: https://mkatoo.github.io/codemirror-markdown-editor/

## Features

- CodeMirror 6によるMarkdown編集
- リアルタイムプレビュー
- GFM（テーブル、タスクリストなど）
- ライト／ダークテーマ
- localStorageへの自動保存
- Markdownファイルのダウンロード
- レスポンシブ表示

## Structure

ViteでCodeMirror、marked、DOMPurifyを単一の依存グラフとしてバンドルする静的サイトです。

```
.
├── .github/workflows/pages.yml
├── app.js
├── index.html
├── package.json
├── package-lock.json
├── styles.css
└── README.md
```

ローカルでは依存関係をインストールして開発サーバーを起動します。

```bash
npm ci
npm run dev
```

表示されたローカルURLを開いてください。
