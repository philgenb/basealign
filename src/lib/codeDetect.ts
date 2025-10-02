import hljs from "highlight.js/lib/core";

import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import go from "highlight.js/lib/languages/go";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import rust from "highlight.js/lib/languages/rust";
import sql from "highlight.js/lib/languages/sql";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import php from "highlight.js/lib/languages/php";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import yaml from "highlight.js/lib/languages/yaml";
import markdown from "highlight.js/lib/languages/markdown";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("java", java);
hljs.registerLanguage("go", go);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("csharp", csharp);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("html", xml); // alias
hljs.registerLanguage("css", css);
hljs.registerLanguage("php", php);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("shell", bash); // alias
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("yml", yaml);   // alias
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("md", markdown); // alias

// Map highlight.js language names to Monaco language ids.
const HLJS_TO_MONACO: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  go: "go",
  cpp: "cpp",
  c: "cpp",
  csharp: "csharp",
  rust: "rust",
  sql: "sql",
  xml: "html",     // monaco uses "html" for html/xml tokenization
  html: "html",
  css: "css",
  php: "php",
  json: "json",
  bash: "shell",   // monaco uses "shell"
  shell: "shell",
  yaml: "yaml",
  yml: "yaml",
  markdown: "markdown",
  md: "markdown",
};

// Options to make detection less noisy for short random text.
const MIN_LENGTH = 3;           // Below this we don't try too hard.
const MIN_CONFIDENCE = 0.15;     // If score is lower, fallback to plaintext.

/** Detect a Monaco language id using highlight.js auto-detection. */
export function detectMonacoLanguage(text: string): string {
  const t = text?.trim() ?? "";
  if (!t) return "plaintext";
  if (t.length < MIN_LENGTH) {
    // Tiny snippets: try a very small fast-path heuristic before falling back
    if (/^\s*</.test(t)) return "html";
    return "plaintext";
  }

  // highlight.js auto detection (sync, fast enough for UI)
  const res = hljs.highlightAuto(t);
  const name = res.language?.toLowerCase();
  const relevanceOk = (res.relevance ?? 0) / 10 >= MIN_CONFIDENCE;

  if (name && relevanceOk) {
    // Direct mapping
    const monacoId = HLJS_TO_MONACO[name];
    if (monacoId) return monacoId;

    // Sometimes highlight.js returns aliases like 'xml' for html
    if (name === "xml") return "html";
    if (name === "shell") return "shell";
  }

  // Fallback: a couple of cheap signals
  if (/^\s*</.test(t) && /<\/?[a-z]/i.test(t)) return "html";
  if (/\bconsole\.log\(|\bexport\s+|import\s+.+from\s+['"]/.test(t)) return "javascript";

  return "plaintext";
}
