import {
    useEffect,
    useRef,
    useState,
    type MutableRefObject
} from "react";
import {motion} from "motion/react";
import Editor, {OnMount} from "@monaco-editor/react";
import {useIsMac} from "./CodeEditor";
import {AnalyseIcon} from "../../assets/imageComponents/AnalyseIcon";
import {detectMonacoLanguage} from "../../lib/codeDetect";
import {LanguageIcon} from "../../assets/imageComponents/LanguageIcon";

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
    /** Optional: callback when user clicks the analyze button */
    onAnalyze?: () => void;
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
                                                                onAnalyze,
                                                            }) => {
    const isMac = useIsMac();
    const [focused, setFocused] = useState(false);
    const [detectedLang, setDetectedLang] = useState<string>(language || "plaintext");
    const containerRef = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef<import("monaco-editor").editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);

    // Expand on paste inside the container (works immediately after load).
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

    // Keep Monaco model language in sync with detected language.
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

        // Keep layout responsive.
        editor.updateOptions({automaticLayout: true});

        // Expose focus() to parent.
        if (editorApiRef) {
            editorApiRef.current = {focus: () => editor.focus()};
        }

        // Track focus only internally (no visible border/ring).
        editor.onDidFocusEditorText(() => setFocused(true));
        editor.onDidBlurEditorText(() => setFocused(false));

        // Collapse on ESC when empty.
        editor.addCommand(monaco.KeyCode.Escape, () => {
            const txt = editor.getValue().trim();
            if (txt === "" && expanded) {
                setExpanded(false);
                blurEditorDom(editor, containerRef.current);
            }
        });

        // Define light theme.
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

        // Expand on paste inside Monaco (if API available).
        try {
            if (typeof (editor as any).onDidPaste === "function") {
                (editor as any).onDidPaste(() => {
                    if (!expanded) setExpanded(true);
                });
            }
        } catch {
        }

        // Initialize detected language from initial value.
        const initialGuess = detectMonacoLanguage(editor.getValue?.() ?? "");
        setDetectedLang(initialGuess || language || "plaintext");
    };

    // Handle editor changes: update value + language guess.
    const handleChange = (v?: string) => {
        const text = v ?? "";
        onChange(text);
        const guessed = detectMonacoLanguage(text);
        if (guessed && guessed !== detectedLang) setDetectedLang(guessed);
    };

    const maxHeight = expanded ? `${heightExpandedVh}vh` : `${heightCollapsed}px`;
    const hasContent = value.trim().length > 0;

    return (
        <motion.div
            ref={containerRef}
            tabIndex={-1}
            layout
            className="relative w-full max-w-3xl mx-auto rounded-2xl border border-black/10 bg-white/80 backdrop-blur shadow-xl transition-[max-height] duration-300 overflow-hidden"
            style={{maxHeight}}
        >
            {/* Header */}
            <div className={`flex items-center justify-between px-7 pt-4 ${expanded ? "opacity-100" : "opacity-80"}`}>
                <div className="text-xs text-black/60">Paste your code below</div>
                <div className="hidden sm:flex items-center gap-1 text-black/70">
                    <kbd
                        className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs font-medium shadow-sm bg-white/80 backdrop-blur border-black/10">
                        {isMac ? "⌘" : "Ctrl"}
                    </kbd>
                    <span className="text-xs">+</span>
                    <kbd
                        className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs font-medium shadow-sm bg-white/80 backdrop-blur border-black/10">
                        V
                    </kbd>
                </div>
            </div>

            {/* Editor wrapper (focus ring removed) */}
            <div className="px-7 pb-4">
                <div
                    className="mt-2 w-full rounded-lg border border-black/10 shadow-inner bg-white"
                    style={{height: expanded ? "50vh" : heightCollapsed - 64}}
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

            {/* Footer: language label (left) + analyze button (right when content exists) */}
            <div className="px-7 pb-6">
                <div className="flex items-center justify-between">
                    {/* Language badge */}
                    <div className="flex gap-2 tracking-tight font-extrabold font-mono text-xs text-[#525A71]">
                        <LanguageIcon/>
                        <span className="font-medium text-black/80">{detectedLang}</span>
                    </div>

                    {/* Analyze button only when there's content */}
                    {hasContent && (
                        <button
                            type="button"
                            onClick={() => (onAnalyze ? onAnalyze() : console.log("Analyze clicked"))}
                            className="ml-3 inline-flex gap-2 items-center rounded-md bg-[#7B96E8] px-5 py-2 text-sm font-bold text-white hover:bg-[#6887E5] active:scale-[0.99] transition"
                        >
                            <AnalyseIcon/>
                            Analyze
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
