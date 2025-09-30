import {
    useEffect,
    useRef,
    useState,
    type MutableRefObject,
} from "react";
import {motion} from "motion/react";
import Editor, {type OnMount} from "@monaco-editor/react";
import {LanguageIcon} from "../../assets/imageComponents/LanguageIcon";
import {detectMonacoLanguage} from "../../lib/codeDetect";
import type {BaselineMinLevel} from "../../lib/BaseLineChecker";
import {useIsMac} from "../../hooks/useIsMac";

type Monaco = typeof import("monaco-editor");

export interface CodeEditorProps {
    value: string;
    onChange: (v: string) => void;
    expanded: boolean;
    setExpanded: (v: boolean) => void;
    language?: string;
    heightCollapsed?: number;
    heightExpandedVh?: number;
    editorApiRef?: MutableRefObject<{ focus: () => void } | null>;
    children?: React.ReactNode;
}

/** Blur the Monaco editor by blurring its DOM node; move focus to container as a safe target. */
function blurEditorDom(
    editor: import("monaco-editor").editor.IStandaloneCodeEditor | null,
    containerEl?: HTMLElement | null
) {
    const node = editor?.getDomNode?.();
    if (node instanceof HTMLElement) node.blur();
    containerEl?.focus?.();
}

export const CodeEditorMonaco: React.FC<CodeEditorProps> = ({
                                                                value,
                                                                onChange,
                                                                expanded,
                                                                setExpanded,
                                                                language = "javascript",
                                                                heightCollapsed = 256,
                                                                heightExpandedVh = 70,
                                                                editorApiRef,
                                                                children
                                                            }) => {
    const isMac = useIsMac();
    const [focused, setFocused] = useState(false);
    const [detectedLang, setDetectedLang] = useState<string>(
        language || "plaintext"
    );
    const containerRef = useRef<HTMLDivElement | null>(null);
    const editorRef =
        useRef<import("monaco-editor").editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const [minLevel] = useState<BaselineMinLevel>("high");

    // Expand on paste inside the container
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const handlePaste = () => {
            if (!expanded) setExpanded(true);
            requestAnimationFrame(() => el.scrollTo({top: el.scrollHeight}));
        };
        el.addEventListener("paste", handlePaste);
        return () => el.removeEventListener("paste", handlePaste);
    }, [expanded, setExpanded]);

    // Auto-collapse when value becomes empty.
    useEffect(() => {
        if (expanded && value.trim() === "") {
            setExpanded(false);
            blurEditorDom(editorRef.current, containerRef.current);
        }
    }, [value, expanded, setExpanded]);

    // Sync Monaco model language
    useEffect(() => {
        const editor = editorRef.current;
        const monaco = monacoRef.current;
        if (!editor || !monaco) return;
        const model = editor.getModel?.();
        if (!model) return;
        const current = (model as any).getLanguageId?.() as string | undefined;
        if (detectedLang && detectedLang !== current) {
            monaco.editor.setModelLanguage(model, detectedLang);
        }
    }, [detectedLang]);

    const handleMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        editor.updateOptions({automaticLayout: true});

        if (editorApiRef) {
            editorApiRef.current = {focus: () => editor.focus()};
        }

        editor.onDidFocusEditorText(() => setFocused(true));
        editor.onDidBlurEditorText(() => setFocused(false));

        editor.addCommand(monaco.KeyCode.Escape, () => {
            const txt = editor.getValue().trim();
            if (txt === "" && expanded) {
                setExpanded(false);
                blurEditorDom(editor, containerRef.current);
            }
        });

        monaco.editor.defineTheme("ba-light", {
            base: "vs",
            inherit: true,
            rules: [],
            colors: {
                "editor.background": "#FFFFFF",
                "editor.lineHighlightBackground": "#FFFFFF",
                "editor.selectionBackground": "#F3F4F6",
                "editorBracketMatch.background": "#E5E7EB40",
                "editorBracketMatch.border": "#E5E7EB80",
                "editorCursor.foreground": "#111827",
                "editorWhitespace.foreground": "#E5E7EB",
                "editor.foreground": "#1F2937",

                "editorGutter.background": "#FFFFFF",
                "editorLineNumber.foreground": "#E8EBF3",
                "editorLineNumber.activeForeground": "#9CA3AF",

                "editorIndentGuide.background": "#E5E7EB",
                "editorIndentGuide.activeBackground": "#D1D5DB",

                // Scrollbar
                "scrollbarSlider.background": "#E5E7EB",
                "scrollbarSlider.hoverBackground": "#D1D5DB",
                "scrollbarSlider.activeBackground": "#9CA3AF"
            },
        });
        monaco.editor.setTheme("ba-light");

        try {
            if (typeof (editor as any).onDidPaste === "function") {
                (editor as any).onDidPaste(() => {
                    if (!expanded) setExpanded(true);
                });
            }
        } catch {
        }

        const initialGuess = detectMonacoLanguage(editor.getValue?.() ?? "");
        setDetectedLang(initialGuess || language || "plaintext");
    };

    const handleChange = (v?: string) => {
        const text = v ?? "";
        onChange(text);
        const guessed = detectMonacoLanguage(text);
        if (guessed && guessed !== detectedLang) setDetectedLang(guessed);
    };

    const maxHeight = expanded ? `${heightExpandedVh}vh` : `${heightCollapsed}px`;

    return (
        <motion.div
            ref={containerRef}
            tabIndex={-1}
            layout
            className={`relative py-3 mx-auto rounded-2xl border border-card bg-white/80 backdrop-blur focus:select-none shadow-card overflow-hidden
    w-full ${expanded ? "max-w-5xl min-h-[500px]" : "max-w-2xl min-h-[300px]"}`}
            transition={{duration: 0.4, ease: [0.25, 0.8, 0.25, 1]}}
        >
            {/* Editor wrapper */}
            <div className="px-7 pb-6">
                <div
                    className="mt-2 w-full rounded-xl shadow-inner bg-white"
                    style={{
                        height: expanded ? "50vh" : heightCollapsed - 64, // mehr Platz wenn expanded
                    }}
                >
                    <Editor
                        value={value}
                        onChange={handleChange}
                        language={detectedLang || language}
                        theme="ba-light"
                        options={{
                            fontSize: 13,
                            lineHeight: 19,
                            minimap: {enabled: false},
                            scrollBeyondLastLine: false,
                            wordWrap: "on",
                            roundedSelection: true,
                            contextmenu: true,
                            padding: {top: 10, bottom: 10},
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

            {/* Footer */}
            <div className="px-7 pb-8">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2 tracking-tight font-extrabold font-mono text-xs text-[#525A71]">
                        <LanguageIcon/>
                        <span className="font-medium text-black/80">{detectedLang}</span>
                    </div>
                </div>
            </div>

            {children}
        </motion.div>

    );
};
