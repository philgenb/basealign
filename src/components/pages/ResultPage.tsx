import React, {useMemo, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import type {BaselineIssue, BaselineReport} from "../../lib/BaseLineChecker";
import {IssuesTable, type ScoredIssue} from "../results/IssuesTables";
import {ScoreCard} from "../results/ScoreCard";
import {BrowserBadge} from "../results/BrowserBadge";
import {IssueBadge} from "../results/IssueBadge";
import {analyzeAccessibility} from "../../lib/analyzeAccesibility";
import {CodeViewer} from "../display/CodeViewer";
import BaselineBG from "../../assets/Baseline_BG.webp";
import {BackToCodeIcon} from "../../assets/imageComponents/BackToCodeIcon";
import {DropdownIcon} from "../../assets/imageComponents/DropdownIcon";
import {TickIcon} from "../../assets/imageComponents/TickIcon";
import {AccessibilityBulletIcon} from "../../assets/imageComponents/AccessibilityBulletIcon";
import {BaseAlignIcon} from "../../assets/imageComponents/BaseAlignIcon";

type Severity = "critical" | "moderate";

function computeSeverity(issue: BaselineIssue): { severity: Severity; score: number } {
    // Only 'false' or 'low' appear as issues (below min)
    if (issue.detectedBaseline === false) return {severity: "critical", score: 2};
    return {severity: "moderate", score: 1};
}

export default function ResultPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const state = location.state as
        | { report?: BaselineReport; sourceSnippet?: string }
        | undefined;

    if (!state?.report) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50">
                <div className="max-w-5xl mx-auto px-6 py-12">
                    <h1 className="text-2xl font-bold text-slate-800">No results yet</h1>
                    <p className="mt-2 text-slate-600">Run an analysis from the editor first.</p>
                    <button
                        onClick={() => navigate("/")}
                        className="mt-6 rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white"
                    >
                        Back to Editor
                    </button>
                </div>
            </div>
        );
    }

    function getErrorLines(code: string, issues: { loc?: { line?: number } }[]) {
        const allLines = code.split("\n");
        const errorLineNumbers = new Set(
            issues.map((iss) => iss.loc?.line).filter((l): l is number => l !== undefined)
        );

        return allLines
            .map((line, idx) => ({
                number: idx + 1,
                content: line,
                isError: errorLineNumbers.has(idx + 1),
            }))
            .filter((l) => l.isError);
    }


    const {report, sourceSnippet = ""} = state;

    const {issues: a11yIssues, score: a11yScore} = useMemo(
        () => analyzeAccessibility(sourceSnippet),
        [sourceSnippet]
    );

    // Score issues and sort
    const scoredAll: ScoredIssue[] = useMemo(
        () =>
            report.issues
                .map((iss) => ({...iss, ...computeSeverity(iss)}))
                .sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score; // critical first
                    const la = a.loc?.line ?? 0, lb = b.loc?.line ?? 0;
                    if (la !== lb) return la - lb;
                    const ca = a.loc?.column ?? 0, cb = b.loc?.column ?? 0;
                    return ca - cb;
                }),
        [report.issues]
    );

    const errorLineNumbers = useMemo(() => {
        return Array.from(
            new Set(
                scoredAll
                    .map(i => i.loc?.line)
                    .filter((n): n is number => typeof n === "number" && n > 0)
            )
        ).sort((a, b) => a - b);
    }, [scoredAll]);

    const counts = useMemo(() => {
        let errors = 0, warnings = 0;
        for (const i of scoredAll) {
            if (i.severity === "critical") {
                errors++;
            } else {
                warnings++;
            }
        }
        return {errors, warnings};
    }, [scoredAll]);

    // Simple scoring heuristic (tunable): 100 - (errors*3 + warnings*2)
    const overallScore = Math.max(0, 100 - (counts.errors * 3 + counts.warnings * 2));

    // Filter for the issues table
    const [filter, setFilter] = useState<"all" | "errors" | "warnings">("all");
    const filtered = useMemo(() => {
        if (filter === "all") return scoredAll;
        if (filter === "errors") return scoredAll.filter((i) => i.severity === "critical");
        return scoredAll.filter((i) => i.severity === "moderate");
    }, [filter, scoredAll]);

    const baselineLabel = report.minLevel === "high" ? "High" : "Low";

    // Derive “problematic with” based on support maps (missing entries)
    const problematic = useMemo(() => {
        const browsers: Array<"chrome" | "firefox" | "safari"> = [];
        const check = (name: "chrome" | "firefox" | "safari") => {
            if (!browsers.includes(name)) browsers.push(name);
        };
        for (const i of scoredAll) {
            const s = i.support ?? {};
            if (s.chrome == null) check("chrome");
            if (s.firefox == null) check("firefox");
            if (s.safari == null && s.safari_ios == null) check("safari");
        }
        return browsers;
    }, [scoredAll]);

    // Create short infringement bullet points from BCD keys
    const infringementBullets = useMemo(() => {
        const uniq = new Map<string, ScoredIssue>();
        for (const i of scoredAll) {
            if (!uniq.has(i.bcdKey)) uniq.set(i.bcdKey, i);
        }
        return [...uniq.values()].slice(0, 4).map((i) => {
            const label = i.value ? `${i.property}: ${i.value}` : i.property;
            return `${label} — ${i.bcdKey}`;
        });
    }, [scoredAll]);

    const copySnippet = async () => {
        try {
            await navigator.clipboard.writeText(sourceSnippet);
        } catch {
            // no-op
        }
    };

    const errorLines = useMemo(
        () => getErrorLines(sourceSnippet, scoredAll),
        [sourceSnippet, scoredAll]
    );

    return (
        <div className="min-h-screen w-full bg-no-repeat bg-cover bg-center bg-fixed"
             style={{backgroundImage: `url(${BaselineBG})`}}
        >
            <div className="max-w-6xl mx-auto px-6 py-16">
                {/* Top header */}
                <div className="relative flex items-center gap-4">
                    <BaseAlignIcon className="-ml-26"/>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-jakarta text-primary">Analysis</h1>
                    </div>
                </div>

                {/* Cards row */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left card: message + counts + filter + copy */}
                    <div className="md:col-span-2 rounded-2xl border border-card shadow-card bg-white  py-8 px-10">
                        <div className="flex items-start justify-between gap-4 h-full">
                            <div className="flex flex-col gap-2">
                                <div className="text-2xl font-bold font-jakarta text-primary">
                                    {counts.errors === 0 ? (
                                        <>
                                            This code snippet already <br/> looks perfect!
                                        </>
                                    ) : counts.errors <= 2 ? (
                                        <>
                                            This code snippet already <br/> looks very solid!
                                        </>
                                    ) : (
                                        <>
                                            We found several compatibility <br/> risks in your code.
                                        </>
                                    )}
                                </div>
                                <div className="mt-4 flex items-center gap-5 text-sm">
                                    <IssueBadge count={counts.errors} label="Errors" variant="error"/>
                                    <IssueBadge count={counts.warnings} label="Warnings" variant="warning"/>
                                </div>
                            </div>

                            <div className="flex flex-col justify-between h-full items-end gap-2">
                                <button
                                    onClick={() => navigate("/")}
                                    className="flex flex-row gap-2 rounded-md bg-[#7B96E8] px-5 py-2.5 text-[13px] font-jakarta items-center justify-center tracking-normal font-bold text-white
             hover:bg-[#6887E5] transition-colors duration-200"
                                    title="Editor"
                                >
                                    <BackToCodeIcon/>
                                    Editor
                                </button>
                                <div className="relative inline-block">
                                    <select
                                        className="appearance-none rounded-lg border border-card bg-white px-5 py-2.5 pr-12 text-sm font-bold font-jakarta text-primary
             focus:outline-none focus:ring-0 focus:border-card"
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value as any)}
                                        title="Filter issues"
                                    >
                                        <option value="all">All</option>
                                        <option value="errors">Errors</option>
                                        <option value="warnings">Warnings</option>
                                    </select>

                                    <span
                                        className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-primary">
                                        <DropdownIcon/>
                                    </span>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Right card: score */}
                    <ScoreCard
                        score={overallScore}
                        segments={[
                            {color: "#ff7072", value: counts.errors * 3},   // red for errors
                            {color: "#ffdb70", value: counts.warnings * 2}, // orange for Warnings
                            {color: "#5cbc4b", value: Math.max(0, 100 - (counts.errors * 3 + counts.warnings * 2))} // green = rest
                        ]}
                    />
                </div>

                {/* Diff-ish card */}
                <div className="mt-6 rounded-2xl border border-card shadow-card bg-white p-6">
                    {/* Three columns: CodeViewer, divider, Accessibility */}
                    <div className="grid grid-cols-1 lg:grid-cols-[56%_2%_42%] gap-6">
                        {/* Left column: CodeViewer */}
                        <div>
                            <div className="text-sm font-semibold font-jetbrains text-[#3B3535] mb-1">Current</div>
                            <CodeViewer code={sourceSnippet} lines={errorLineNumbers}/>
                        </div>

                        {/* Custom vertical divider */}
                        <div className="hidden lg:flex justify-center">
                            <div
                                className="w-[1.6px] h-full bg-gradient-to-b from-transparent via-[#E5E7EB] to-transparent"/>
                        </div>


                        {/* Right column: Accessibility Score */}
                        <div>
                            <div className="text-sm font-semibold font-jetbrains text-[#3B3535] mb-3">
                                Accessibility
                            </div>

                            {a11yIssues.length === 0 ? (
                                // Case 1: No issues
                                <div className="flex flex-col items-center justify-center text-center mt-5">
                                    {/* Check Icon */}
                                    <div className="mb-3 flex items-center justify-center">
                                        <TickIcon/>
                                    </div>
                                    {/* Text */}
                                    <p className="font-jetbrains font-semibold text-sm text-[#525A71] decoration-blue-500">
                                        Perfect as it is.
                                    </p>
                                </div>
                            ) : (
                                // Case 2: Issues list
                                <ul className="mt-5 space-y-3 text-sm font-medium text-[#747D86] font-jakarta">
                                    {a11yIssues.map((iss, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            {/* Custom bullet icon */}
                                            <AccessibilityBulletIcon/>
                                            {/* Issue text */}
                                            <span>{iss.message}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                    </div>

                    {/* Custom horizontal divider */}
                    <div className="w-full h-[1.6px] mt-4 bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent"/>


                    {/* Infringement + Problematic with */}
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <div className="text-sm font-bold font-jetbrains text-[#3B3535]">Infringement</div>
                            <ul className="mt-2 list-disc font-medium  font-jakarta pl-5 text-sm text-[#747D86]">
                                {infringementBullets.length === 0 ? (
                                    <li>No notable incompatibilities detected.</li>
                                ) : (
                                    infringementBullets.map((t, i) => <li key={i}>{t}</li>)
                                )}
                            </ul>
                        </div>
                        <div>
                            <div className="text-sm font-bold font-jetbrains text-[#3B3535]">Problematic with</div>
                            <div className="mt-3.5 flex items-center gap-3">
                                {problematic.length === 0 ? (
                                    <span className="text-sm text-[#747D86]">No major browser risks.</span>
                                ) : (
                                    problematic.map((b) => <BrowserBadge key={b} name={b}/>)
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom: the extracted issues table */}
                <IssuesTable issues={filtered}/>
            </div>
        </div>
    );
}
