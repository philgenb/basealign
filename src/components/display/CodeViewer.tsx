import React, { useEffect, useRef } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github.css"; // Beispiel-Theme

interface CodeViewerProps {
  code: string;
  language?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language = "javascript",
}) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const lines = code ? code.split("\n") : ["/* No source code provided */"];

  return (
    <div className="rounded-lg overflow-hidden bg-white border border-gray-100">
      <div className="relative flex font-jetbrains text-sm leading-6">
        {/* Line numbers */}
        <div className="bg-gray-50 text-gray-400 pr-4 py-4 select-none text-right tabular-nums">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code */}
        <pre className="overflow-x-auto p-4 m-0">
          <code ref={codeRef} className={language}>
            {code || "/* No source code provided */"}
          </code>
        </pre>
      </div>
    </div>
  );
};
