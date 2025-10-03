import React from "react";
import type {BaselineIssue} from "../../lib/BaseLineChecker";

type Severity = "critical" | "moderate";
export type ScoredIssue = BaselineIssue & { severity: Severity; score: number };

function SeverityBadge({s}: { s: Severity }) {
    const styles =
        s === "critical"
            ? "bg-red-100 text-red-700 border-red-200"
            : "bg-amber-100 text-amber-700 border-amber-200";
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${styles}`}>
      {s === "critical" ? "Critical" : "Moderate"}
    </span>
    );
}

/** Table showing all scored issues. Pure presentational component. */
export const IssuesTable: React.FC<{ issues: ScoredIssue[] }> = ({issues}) => {
    return (
        <div className="mt-8 overflow-x-auto rounded-xl border font-jakarta border-card bg-white shadow-card">
            <table className="min-w-full text-left text-sm">
                <thead className="bg-[#FAFAFA] ">
                <tr className="text-[#3B3535]">
                    <th className="px-4 py-3 font-semibold">Severity</th>
                    <th className="px-4 py-3 font-semibold">Location</th>
                    <th className="px-4 py-3 font-semibold">Kind</th>
                    <th className="px-4 py-3 font-semibold">Property</th>
                    <th className="px-4 py-3 font-semibold">Value</th>
                    <th className="px-4 py-3 font-semibold">BCD key</th>
                    <th className="px-4 py-3 font-semibold">Detected Baseline</th>
                    <th className="px-4 py-3 font-semibold">Support (major)</th>
                </tr>
                </thead>
                <tbody>
                {issues.length === 0 ? (
                    <tr>
                        <td colSpan={8} className="px-4 py-6 text-center text-[#747D86]">
                            No issues found below the chosen minimum baseline.
                        </td>
                    </tr>
                ) : (
                    issues.map((iss, i) => (
                        <tr
                            key={`${iss.bcdKey}-${iss.loc?.line}-${iss.loc?.column}-${i}`}
                            className="border-t border-[#F5F5F5]"
                        >
                            <td className="px-4 py-2 align-top">
                                <SeverityBadge s={iss.severity}/>
                            </td>
                            <td className="px-4 py-2 align-top">
                                {iss.loc ? `L${iss.loc.line}:C${iss.loc.column}` : "—"}
                            </td>
                            <td className="px-4 py-2 align-top">{iss.kind}</td>
                            <td className="px-4 py-2 align-top font-mono">{iss.property}</td>
                            <td className="px-4 py-2 align-top font-mono">{iss.value ?? "—"}</td>
                            <td className="px-4 py-2 align-top font-mono text-[12px]">
                                {iss.bcdKey}
                            </td>
                            <td className="px-4 py-2 align-top">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">
                    {String(iss.detectedBaseline)}
                  </span>
                                <div className="mt-1 text-[11px] text-slate-500">
                                    {iss.baselineHighDate && <>high: {iss.baselineHighDate} </>}
                                    {iss.baselineLowDate && <>· low: {iss.baselineLowDate}</>}
                                </div>
                            </td>
                            <td className="px-4 py-2 align-top text-[12px]">
                                {iss.support
                                    ? Object.entries(iss.support)
                                        .slice(0, 6)
                                        .map(([br, v]) => `${br}:${v}`)
                                        .join(" · ")
                                    : "—"}
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
};

