import React, {useMemo, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import type {BaselineIssue, BaselineReport} from "../../lib/BaseLineChecker";
import {IssuesTable, type ScoredIssue} from "../results/IssuesTables";
import {ScoreCard} from "../results/ScoreCard";
import {BrowserBadge} from "../results/BrowserBadge";
import {IssueBadge} from "../results/IssueBadge";
import {analyzeAccessibility} from "../../lib/analyzeAccesibility";
import {AccessibilityScore} from "../results/AccessibilityScore";

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

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-16">
                {/* Top header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-jakarta text-primary">Analysis</h1>
                    </div>
                    <button
                        onClick={() => navigate("/")}
                        className="shrink-0 rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                    >
                        Back to Editor
                    </button>
                </div>

                {/* Cards row */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left card: message + counts + filter + copy */}
                    <div className="md:col-span-2 rounded-2xl border border-card shadow-card bg-white  py-8 px-10">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-col gap-2">
                                <div className="text-2xl font-bold font-jakarta text-primary">
                                    {counts.errors + counts.warnings === 0 ? (
                                        <>
                                            This code snippet already <br/> looks very solid!
                                        </>
                                    ) : (
                                        "We found some opportunities to improve compatibility."
                                    )}
                                </div>
                                <div className="mt-4 flex items-center gap-5 text-sm">
                                    <IssueBadge count={counts.errors} label="Errors" variant="error"/>
                                    <IssueBadge count={counts.warnings} label="Warnings" variant="warning"/>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={copySnippet}
                                    className="rounded-md border border-card shadow-card bg-slate-50 px-3 py-2 text-xs font-semibold hover:bg-slate-100"
                                    title="Copy code"
                                >
                                    Code
                                </button>
                                <select
                                    className="rounded-md border border-card shadow-card bg-white px-3 py-2 text-xs"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value as any)}
                                    title="Filter issues"
                                >
                                    <option value="all">All</option>
                                    <option value="errors">Errors</option>
                                    <option value="warnings">Warnings</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Right card: score */}
                    <ScoreCard
                        score={overallScore}
                        segments={[
                            {color: "#ff7072", value: counts.errors * 3},   // rot für Errors
                            {color: "#ffdb70", value: counts.warnings * 2}, // orange für Warnings
                            {color: "#5cbc4b", value: Math.max(0, 100 - (counts.errors * 3 + counts.warnings * 2))} // grün = Rest
                        ]}
                    />
                </div>

                {/* Diff-ish card */}
                <div className="mt-6 rounded-2xl border border-card shadow-card bg-white p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <div className="text-sm font-semibold font-jetbrains text-[#AEAEAE] mb-2">Current</div>
                            <pre
                                className="text-xs leading-5 font-jetbrains text-[#707083] p-4 rounded-lg overflow-x-auto">
                {sourceSnippet || "/* No source code provided */"}
              </pre>
                        </div>
                        <div>
                            <div className="text-sm font-semibold font-jetbrains text-[#AEAEAE] mb-3">Accessibility Score
                            </div>
                            <div>
                                <AccessibilityScore score={a11yScore}/>
                                <ul className="mt-5 list-disc pl-5 text-sm font-medium text-[#747D86] font-jakarta space-y-1">
                                    {a11yIssues.length === 0 ? (
                                        <li>No accessibility issues detected.</li>
                                    ) : (
                                        a11yIssues.map((iss, i) => <li key={i}>{iss.message}</li>)
                                    )}
                                </ul>
                            </div>

                        </div>
                    </div>

                    <div className="w-full h-[1.6px] bg-gray-50"/>


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
