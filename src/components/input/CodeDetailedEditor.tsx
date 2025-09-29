// src/components/CodeEditorMonaco.tsx
import {
  useEffect, useMemo, useRef, useState, type ReactNode, type MutableRefObject
} from "react";
import { motion } from "motion/react";
import Editor, { OnMount } from "@monaco-editor/react";
import {useIsMac} from "./CodeEditor";

/** ... Kbd + useIsMac wie gehabt ... */

export interface CodeEditorProps {
  value: string;
  onChange: (v: string) => void;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  language?: string;
  heightCollapsed?: number;
  heightExpandedVh?: number;
  /** NEW: expose small imperative API (focus) to parent */
  editorApiRef?: MutableRefObject<{ focus: () => void } | null>;
}

export const CodeEditorMonaco: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  expanded,
  setExpanded,
  language = "javascript",
  heightCollapsed = 256,
  heightExpandedVh = 70,
  editorApiRef, // NEW
}) => {
  const isMac = useIsMac();
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<import("monaco-editor").editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handlePaste = () => {
      if (!expanded) setExpanded(true);
      requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight }));
    };
    el.addEventListener("paste", handlePaste);
    return () => el.removeEventListener("paste", handlePaste);
  }, [expanded, setExpanded]);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.updateOptions({ automaticLayout: true });

    // expose focus() to parent
    if (editorApiRef) {
      editorApiRef.current = {
        focus: () => editor.focus(),
      };
    }

    editor.onDidFocusEditorText(() => setFocused(true));
    editor.onDidBlurEditorText(() => setFocused(false));

    // Light theme (wie zuvor definiert)
    monaco.editor.defineTheme("ba-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#FAFAFA",
        "editor.lineHighlightBackground": "#00000010",
        "editor.selectionBackground": "#3B82F620",
        "editorBracketMatch.background": "#3B82F612",
        "editorBracketMatch.border": "#3B82F640",
        "editorCursor.foreground": "#111827",
        "editorWhitespace.foreground": "#00000022",
        "editor.foreground": "#1F2937",
        "editorGutter.background": "#FAFAFA",
        "editorIndentGuide.background": "#0000001a",
        "scrollbarSlider.background": "#0000001f",
        "scrollbarSlider.hoverBackground": "#00000033",
        "scrollbarSlider.activeBackground": "#0000004d",
      },
    });
    monaco.editor.setTheme("ba-light");

    try {
      if (typeof (editor as any).onDidPaste === "function") {
        (editor as any).onDidPaste(() => {
          if (!expanded) setExpanded(true);
        });
      }
    } catch {}
  };

  const maxHeight = expanded ? `${heightExpandedVh}vh` : `${heightCollapsed}px`;

  return (
    <motion.div
      ref={containerRef}
      layout
      className="relative w-full max-w-3xl mx-auto rounded-2xl border border-black/10 bg-white/80 backdrop-blur shadow-xl transition-[max-height] duration-300 overflow-hidden"
      style={{ maxHeight }}
    >
      {/* ... Header bleibt gleich ... */}

      <div className="px-4 pb-4">
        <div
          className={`mt-2 w-full rounded-lg border border-black/10 shadow-inner bg-white ${focused ? "ring-2 ring-blue-400/40" : ""}`}
          style={{ height: expanded ? "50vh" : heightCollapsed - 64 }}
        >
          <Editor
            value={value}
            onChange={(v) => onChange(v ?? "")}
            language={language}
            theme="ba-light"
            /** ariaLabel, damit wir notfalls selektieren/fokussieren können */
            ariaLabel="Monaco code editor"
            options={{
              fontSize: 13,
              lineHeight: 19,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              roundedSelection: true,
              contextmenu: true,
              padding: { top: 10, bottom: 10 },
              renderLineHighlight: "line",
              smoothScrolling: true,
              scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
            }}
            onMount={handleMount}
          />
        </div>
      </div>

      {/* ... Footer bleibt gleich ... */}
    </motion.div>
  );
};
