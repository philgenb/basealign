import React, {useEffect, useRef, useState} from "react";
import {BaseAlignIcon} from "../../assets/imageComponents/BaseAlignIcon";
import {CodeEditorMonaco} from "../input/CodeDetailedEditor";
import {useIsMac} from "../../hooks/useIsMac";
import {AppleKeyIcon} from "../../assets/imageComponents/AppleKeyIcon";
import {VKeyIcon} from "../../assets/imageComponents/VKeyIcon";
import {AnalyseIcon} from "../../assets/imageComponents/AnalyseIcon";
import {analyzeCssString} from "../../lib/analyseCSS";
import {useNavigate} from "react-router-dom";
import type {BaselineMinLevel} from "../../lib/BaseLineChecker";
import {motion} from "motion/react";

const LandingPage: React.FC = () => {
    const [code, setCode] = useState<string>("");
    const [expanded, setExpanded] = useState<boolean>(false);
    const isMac = useIsMac();
    const editorApiRef = useRef<{ focus: () => void } | null>(null);
    const navigate = useNavigate();
    const [minLevel] = useState<BaselineMinLevel>("high");
    const [detectedLang, setDetectedLang] = useState<string>("plaintext");

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
                const el = document.querySelector<HTMLElement>(
                    "[aria-label='Monaco code editor']"
                );
                el?.focus();
            });
        };

        window.addEventListener("paste", onGlobalPaste);
        return () => window.removeEventListener("paste", onGlobalPaste);
    }, []);

    const onAnalyze = () => {
        try {
            let report;

            console.log(detectedLang);
            if (detectedLang === "css") {
                report = analyzeCssString(code, minLevel);
            } else {
                report = {
                    inputLanguage: detectedLang as "css" | "javascript" | "plaintext",
                    minLevel,
                    issues: [],
                    summary: {totalChecked: 0, belowMinLevel: 0},
                };
            }

            navigate("/results", {
                state: {report, sourceSnippet: code},
            });
        } catch (e) {
            console.error("[Baseline] navigation failed:", e);
        }
    };


    return (
        <div
            className="min-h-screen w-full bg-[radial-gradient(80%_60%_at_50%_0%,#eef2ff_0%,#f8fafc_40%,#ffffff_100%)] bg-no-repeat bg-fixed">
            <div className="px-4 sm:px-6 lg:px-8 py-14">
                <motion.div
                    layout
                    className={`max-w-3xl flex ${
                        expanded
                            ? "flex-row ml-10 items-center justify-start text-left"
                            : "flex-col mx-auto items-center text-center"
                    }`}
                >
                    <BaseAlignIcon/>

                    <div className={expanded ? "flex flex-col items-start" : ""}>
                        <motion.h1
                            layout
                            variants={{
                                collapsed: {scale: 1, fontSize: "56px"},
                                expanded: {scale: 0.9, fontSize: "36px"},
                            }}
                            initial="collapsed"
                            animate={expanded ? "expanded" : "collapsed"}
                            transition={{duration: 0.4, ease: [0.25, 0.8, 0.25, 1]}}
                            className="font-jakarta font-bold tracking-tight text-primary"
                        >
                            Test your browser baseline
                        </motion.h1>

                        {/* Subheadline nur im collapsed-State */}
                        {!expanded && (
                            <motion.p
                                layout
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                                transition={{duration: 0.3}}
                                className="mt-6 text-base tracking-tight font-medium text-[#6A6F77] max-w-3xl"
                            >
                                Quickly check if your project runs on a shared baseline across different
                                browsers. Detect missing features, compare support, and ensure consistent
                                user experiences.
                            </motion.p>
                        )}
                    </div>
                </motion.div>


                <div
                    className={`w-full relative flex justify-center ${
                        expanded ? "mt-6" : "mt-10"
                    }`}
                >
                    <CodeEditorMonaco
                        value={code}
                        onChange={setCode}
                        expanded={expanded}
                        setExpanded={setExpanded}
                        editorApiRef={editorApiRef}
                        language="javascript"
                        heightCollapsed={256}
                        heightExpandedVh={70}
                        onLanguageChange={setDetectedLang}
                    >
                        {/* Shortcuts hint */}
                        {!expanded && (
                            <motion.div
                                initial={{opacity: 0, scale: 0.8, rotate: -5}}
                                animate={{opacity: 1, scale: 1, rotate: 0}}
                                exit={{opacity: 0, scale: 0.8, rotate: 5}}
                                transition={{duration: 0.4, ease: [0.25, 0.8, 0.25, 1]}}
                                className="absolute flex justify-end items-center gap-1 right-8 bottom-7"
                            >
                                <AppleKeyIcon className="h-10"/>
                                <p className="font-jetbrains font-medium text-lg text-[#CED4E5]">+</p>
                                <VKeyIcon className="h-10"/>
                            </motion.div>
                        )}

                        {/* Analyze Button only when expanded */}
                        {expanded && code.trim().length > 0 && (
                            <motion.div
                                initial={{opacity: 0, scale: 0.7, y: 10}}
                                animate={{opacity: 1, scale: 1, y: 0}}
                                exit={{opacity: 0, scale: 0.6, y: 10}}
                                transition={{type: "spring", stiffness: 300, damping: 25}}
                                className="absolute right-6 bottom-6"
                            >
                                <button
                                    type="button"
                                    onClick={onAnalyze}
                                    className="inline-flex gap-2 items-center rounded-md bg-[#7B96E8] px-6 py-2 text-base font-bold text-white hover:bg-[#6887E5] active:scale-[0.97] transition"
                                >
                                    <AnalyseIcon/>
                                    Analyze
                                </button>
                            </motion.div>
                        )}
                    </CodeEditorMonaco>
                </div>


            </div>
        </div>
    );
};

export default LandingPage;
