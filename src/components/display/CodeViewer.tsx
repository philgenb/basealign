import React, { useEffect, useMemo, useRef } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github.css"; // you can swap themes

interface CodeViewerProps {
  code: string;
  language?: string;
  minLines?: number; // default 6–10 is nice; we'll default to 10 here
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language = "javascript",
  minLines = 1,
}) => {
  const codeRef = useRef<HTMLElement>(null);

  // Split and pad to a minimum of N lines (so the row heights always look stable)
  const paddedLines = useMemo(() => {
    const arr = (code ?? "").split("\n");
    if (arr.length < minLines) {
      return [...arr, ...Array(minLines - arr.length).fill("")];
    }
    return arr;
  }, [code, minLines]);

  // Render string for the code block (must match paddedLines count)
  const displayCode = useMemo(() => paddedLines.join("\n"), [paddedLines]);

  // Re-run highlight.js when content/language changes
  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [displayCode, language]);

  return (
    <div className="rounded-lg overflow-hidden bg-white">
      <div className="relative flex font-jetbrains text-sm leading-6">
        {/* Line numbers (fixed width, same vertical rhythm) */}
        <div className="text-[#B6B7B9] pr-4 py-4 select-none text-right tabular-nums">
          {paddedLines.map((_, i) => (
            <div key={i} className="leading-6 text-[#B6B7B9] font-jetbrains font-bold">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code column (single block, but normalized so it matches the numbers’ rhythm) */}
        <pre
          className="
            overflow-x-auto p-4 m-0
            whitespace-pre
            leading-6
            font-jetbrains
            text-sm
            /* Normalize highlight.js defaults on descendants */
            [&_code.hljs]:!p-0
            [&_code.hljs]:!m-0
            [&_code.hljs]:!bg-transparent
            [&_code.hljs]:!leading-6
          "
        >
          <code
            ref={codeRef}
            className={`hljs ${language} text-[#707083] font-bold text-sm`}
            // Hard override in case the theme sets display/padding/margin on code.hljs
            style={{ display: "block", padding: 0, margin: 0, lineHeight: "1.5rem" }}
          >
            {displayCode || "/* No source code provided */"}
          </code>
        </pre>
      </div>
    </div>
  );
};
