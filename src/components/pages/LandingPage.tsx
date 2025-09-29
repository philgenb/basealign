import React, { useEffect, useRef, useState } from "react";
import { BaseAlignIcon } from "../../assets/imageComponents/BaseAlignIcon";
import { CodeEditorMonaco } from "../input/CodeDetailedEditor";
import {useIsMac} from "../../hooks/useIsMac";

const LandingPage: React.FC = () => {
  const [code, setCode] = useState<string>("");
  const [expanded, setExpanded] = useState<boolean>(false);
  const isMac = useIsMac();

  const editorApiRef = useRef<{ focus: () => void } | null>(null);

  useEffect(() => {
    const onGlobalPaste = (e: ClipboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      const tag = (tgt?.tagName ?? "").toUpperCase();
      const isEditable =
        tag === "INPUT" || tag === "TEXTAREA" || Boolean(tgt?.isContentEditable);
      if (isEditable) return;

      const text = e.clipboardData?.getData("text") ?? "";
      if (!text.trim()) return;

      e.preventDefault();
      setExpanded(true);
      setCode((prev) => (prev ? `${prev}\n${text}` : text));

      requestAnimationFrame(() => {
        editorApiRef.current?.focus();

        const el = document.querySelector<HTMLElement>("[aria-label='Monaco code editor']");
        el?.focus();
      });
    };

    window.addEventListener("paste", onGlobalPaste);
    return () => window.removeEventListener("paste", onGlobalPaste);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(80%_60%_at_50%_0%,#eef2ff_0%,#f8fafc_40%,#ffffff_100%)] bg-no-repeat bg-fixed">
      <div className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-3xl flex flex-col items-center text-center">
          <BaseAlignIcon className="mb-6 h-16 w-16" />
          <h1 className="mt-4 text-5xl font-jarkata font-bold tracking-tight text-gray-900">
            Test your browser baseline
          </h1>
          <p className="mt-6 text-base font-medium text-[#6A6F77] max-w-3xl">
            Quickly check if your project runs on a shared baseline across different
            browsers. Detect missing features, compare support, and ensure consistent
            user experiences.
          </p>
        </div>

        <div className="mt-10 justify-center">
          <CodeEditorMonaco
            value={code}
            onChange={setCode}
            expanded={expanded}
            setExpanded={setExpanded}
            editorApiRef={editorApiRef}
            language="javascript"
            heightCollapsed={256}
            heightExpandedVh={70}
          />
        </div>

        {!expanded && (
          <div className="mt-4 text-center text-sm text-black/50">
            Press {isMac ? "⌘" : "Ctrl"}+V to paste your code and expand the editor
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
