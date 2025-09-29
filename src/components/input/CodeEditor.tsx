import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
  type ClipboardEvent as ReactClipboardEvent,
} from "react";
import { motion } from "motion/react";

/** Small keyboard key badge */
export const Kbd: React.FC<{ children: ReactNode }> = ({ children }) => (
  <kbd className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs font-medium shadow-sm bg-white/70 backdrop-blur border-black/10">
    {children}
  </kbd>
);

/** OS hint for ⌘/Ctrl */
export const useIsMac = (): boolean =>
  useMemo(() => /Mac|iPhone|iPad|iPod/.test(navigator.userAgent), []);

/** Auto-resize a textarea to its content */
export const autoResizeTextarea = (el: HTMLTextAreaElement | null): void => {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
};

export interface CodeEditorProps {
  value: string;
  onChange: (v: string) => void;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  expanded,
  setExpanded,
}) => {
  const isMac = useIsMac();
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const [focused, setFocused] = useState<boolean>(false);

  // Resize on mount/value change
  useEffect(() => {
    autoResizeTextarea(taRef.current);
  }, [value]);

  // Expand when pasting inside the editor
  const handlePasteInside = (e: ReactClipboardEvent<HTMLTextAreaElement>) => {
    setExpanded(true);
    requestAnimationFrame(() =>
      taRef.current?.scrollTo({ top: taRef.current.scrollHeight })
    );
  };

  // Handle TAB indentation
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const el = taRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = value.slice(0, start) + "\t" + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + 1;
      autoResizeTextarea(el);
    });
  };

  return (
    <motion.div
      layout
      className={`relative w-full max-w-3xl mx-auto rounded-2xl border border-black/10 bg-white/70 backdrop-blur shadow-xl transition-[max-height] duration-300 overflow-hidden ${
        expanded ? "max-h-[70vh]" : "max-h-64"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 -top-1 h-1 bg-gradient-to-r from-transparent via-black/10 to-transparent" />
      <div
        className={`flex items-center justify-between px-4 pt-4 ${
          expanded ? "opacity-100" : "opacity-70"
        }`}
      >
        <div className="text-xs text-black/50">Paste your code below</div>
        <div className="hidden sm:flex items-center gap-1 text-black/60">
          <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
          <span className="text-xs">+</span>
          <Kbd>V</Kbd>
        </div>
      </div>

      <div className="px-4 pb-4">
        <textarea
          ref={taRef}
          aria-label="Code editor"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onPaste={handlePasteInside}
          onKeyDown={handleKeyDown}
          className={`mt-2 w-full resize-none bg-white/70 outline-none rounded-lg border border-black/10 p-4 font-mono text-[13px] leading-[1.45] shadow-inner min-h-[120px] ${
            focused ? "ring-2 ring-blue-400/50" : ""
          }`}
          placeholder="Paste your code here…"
        />
      </div>

      {!expanded && (
        <div className="absolute bottom-3 right-4 hidden sm:flex items-center gap-1 text-black/60">
          <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
          <span className="text-xs">+</span>
          <Kbd>V</Kbd>
        </div>
      )}
    </motion.div>
  );
};
