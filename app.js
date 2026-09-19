import { basicSetup, EditorView } from "codemirror";
import { EditorState, StateEffect } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { marked } from "marked";
import DOMPurify from "dompurify";

const STORAGE_KEY = "codemirror-markdown-editor:document";
const THEME_KEY = "codemirror-markdown-editor:theme";

const sample = `# Markdown Studio

CodeMirror 6を使った、ブラウザで動くMarkdownエディタです。

## できること

- Markdownのシンタックスハイライト
- リアルタイムプレビュー
- ブラウザへの自動保存
- ライト／ダークテーマ
- Markdownファイルのダウンロード

> 左側を書き換えると、右側のプレビューがすぐに更新されます。

### コードも書けます

\`\`\`js
const greeting = "Hello, CodeMirror!";
console.log(greeting);
\`\`\`

| 機能 | 状態 |
| --- | --- |
| 編集 | ✅ |
| プレビュー | ✅ |
| 自動保存 | ✅ |

さっそく、この文章を編集してみてください。
`;

const root = document.documentElement;
const workspace = document.querySelector(".workspace");
const preview = document.querySelector("#preview");
const saveStatus = document.querySelector("#save-status");
const lineCount = document.querySelector("#line-count");
const characterCount = document.querySelector("#character-count");

let saveTimer;
let view;

const prefersDark = matchMedia("(prefers-color-scheme: dark)");
const storedTheme = localStorage.getItem(THEME_KEY);
let theme = storedTheme || (prefersDark.matches ? "dark" : "light");

function setTheme(nextTheme) {
  theme = nextTheme;
  root.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);

  if (view) {
    view.dispatch({
      effects: StateEffect.reconfigure.of(editorExtensions()),
    });
  }
}

function editorExtensions() {
  return [
    basicSetup,
    markdown(),
    EditorView.lineWrapping,
    theme === "dark" ? oneDark : [],
    EditorView.updateListener.of((update) => {
      if (!update.docChanged) return;
      refresh(update.state.doc.toString());
    }),
  ];
}

function renderMarkdown(source) {
  preview.innerHTML = DOMPurify.sanitize(marked.parse(source, {
    gfm: true,
    breaks: true,
  }));
}

function refresh(source) {
  renderMarkdown(source);
  lineCount.textContent = `${source.split("\n").length}行`;
  characterCount.textContent = `${[...source].length}文字`;
  saveStatus.textContent = "保存中…";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, source);
    saveStatus.textContent = "保存済み";
  }, 350);
}

function wrapSelection(before, after = before) {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);
  view.dispatch({
    changes: { from, to, insert: before + (selected || "テキスト") + after },
    selection: { anchor: from + before.length, head: from + before.length + (selected || "テキスト").length },
  });
  view.focus();
}

function prefixLines(prefix) {
  const selection = view.state.selection.main;
  const line = view.state.doc.lineAt(selection.from);
  view.dispatch({ changes: { from: line.from, insert: prefix } });
  view.focus();
}

const initialDocument = localStorage.getItem(STORAGE_KEY) || sample;

root.dataset.theme = theme;
view = new EditorView({
  state: EditorState.create({
    doc: initialDocument,
    extensions: editorExtensions(),
  }),
  parent: document.querySelector("#editor"),
});
refresh(initialDocument);

document.querySelector("#theme-button").addEventListener("click", () => {
  setTheme(theme === "dark" ? "light" : "dark");
});

document.querySelector("#download-button").addEventListener("click", () => {
  const blob = new Blob([view.state.doc.toString()], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "document.md";
  anchor.click();
  URL.revokeObjectURL(url);
});

document.querySelector("#reset-button").addEventListener("click", () => {
  if (!confirm("編集中の内容をサンプル文書に戻しますか？")) return;
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: sample },
  });
  view.focus();
});

document.querySelectorAll("[data-wrap]").forEach((button) => {
  button.addEventListener("click", () => wrapSelection(button.dataset.wrap));
});

document.querySelectorAll("[data-prefix]").forEach((button) => {
  button.addEventListener("click", () => prefixLines(button.dataset.prefix));
});

document.querySelector("[data-link]").addEventListener("click", () => {
  wrapSelection("[", "](https://example.com)");
});

document.querySelectorAll(".mobile-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".mobile-tab").forEach((item) => {
      item.classList.toggle("is-active", item === tab);
    });
    workspace.dataset.mobilePanel = tab.dataset.panel;
  });
});

document.addEventListener("keydown", (event) => {
  if (!(event.ctrlKey || event.metaKey)) return;

  if (event.key.toLowerCase() === "s") {
    event.preventDefault();
    localStorage.setItem(STORAGE_KEY, view.state.doc.toString());
    saveStatus.textContent = "保存済み";
  }

  if (event.key.toLowerCase() === "b") {
    event.preventDefault();
    wrapSelection("**");
  }

  if (event.key.toLowerCase() === "i") {
    event.preventDefault();
    wrapSelection("*");
  }
});
