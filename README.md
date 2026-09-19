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

ビルド工程はありません。CodeMirror、marked、DOMPurifyをES Modules CDNから読み込む静的サイトです。

```
.
├── .github/workflows/pages.yml
├── app.js
├── index.html
├── styles.css
└── README.md
```

ローカルでは静的HTTPサーバーを起動して確認できます。

```bash
python -m http.server 8000
```

その後、http://localhost:8000 を開いてください。
