import React, { useEffect, useMemo, useRef } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github.css"; // swap theme if you want

interface CodeViewerProps {
  code: string;
  language?: string;
  minLines?: number;           // pad to at least N rows
  lines?: number[];            // 1-based line numbers to highlight
  highlightColor?: string;     // color for the gutter box
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language = "javascript",
  minLines = 2,
  lines,
  highlightColor = "#FFD775",
}) => {
  const codeRef = useRef<HTMLElement>(null);

  // Split & pad so gutter and code share the same visual row count
  const paddedLines = useMemo(() => {
    const arr = (code ?? "").split("\n");
    return arr.length >= minLines ? arr : [...arr, ...Array(minLines - arr.length).fill("")];
  }, [code, minLines]);

  const displayCode = useMemo(() => paddedLines.join("\n"), [paddedLines]);
  const marked = useMemo(() => new Set((lines ?? []).filter((n) => n > 0)), [lines]);

  useEffect(() => {
    if (codeRef.current) hljs.highlightElement(codeRef.current);
  }, [displayCode, language]);

  return (
    <div className="rounded-lg overflow-hidden bg-white">
      <div className="relative flex font-jetbrains text-sm leading-6">
        {/* Gutter (line numbers) */}
        <div className="py-4 select-none tabular-nums" style={{ width: 56 }}>
          {paddedLines.map((_, i) => {
            const lineNo = i + 1;
            const isMarked = marked.has(lineNo);
            return (
              <div
                key={i}
                className="relative h-6 leading-6 flex items-center"
                style={{ lineHeight: "1.5rem" }} // keep in sync with code lines
                title={`Line ${lineNo}`}
              >
                {/* Absolute colored box INSIDE this row (aligned to this specific number) */}
                {isMarked && (
                  <span
                    aria-hidden
                    className="absolute inset-y-0 right-1 rounded"
                    style={{
                      background: highlightColor,
                      width: 37, // badge width; adjust if needed
                      height: 22
                    }}
                  />
                )}

                {/* Right-aligned number; placed above the box */}
                <div className="w-12 pr-3 text-right relative z-10">
                  <span className={`font-bold ${isMarked ? "text-white" : "text-[#B6B7B9]"}`}>
                    {lineNo}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Code block (single pre/code like your original) */}
        <pre className="overflow-x-auto p-4 m-0">
          <code
            ref={codeRef}
            className={`hljs ${language} text-[#707083] font-bold text-sm`}
            style={{ display: "block", padding: 0, margin: 0, lineHeight: "1.5rem" }}
          >
            {displayCode || "/* No source code provided */"}
          </code>
        </pre>
      </div>
    </div>
  );
};
