import { useLocation, useNavigate } from "react-router-dom";
import type {BaselineIssue, BaselineReport} from "../../lib/BaseLineChecker";

type Severity = "critical" | "moderate";
type ScoredIssue = BaselineIssue & { severity: Severity; score: number };

function computeSeverity(issue: BaselineIssue): { severity: Severity; score: number } {
  // BaselineChecker only records issues that are below the chosen minimum.
  // So only 'false' or 'low' can appear here.
  if (issue.detectedBaseline === false) return { severity: "critical", score: 2 };
  return { severity: "moderate", score: 1 };
}

function SeverityBadge({ s }: { s: Severity }) {
  const styles =
    s === "critical"
      ? "bg-red-100 text-red-700 border-red-200"
      : "bg-amber-100 text-amber-700 border-amber-200";
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${styles}`}>
      {s === "critical" ? "Critical" : "Moderate"}
    </span>
  );
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

  const { report } = state;

  // Enrich & sort by severity, then by location (line/column)
  const scored: ScoredIssue[] = report.issues
    .map((iss) => ({ ...iss, ...computeSeverity(iss) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score; // critical first
      const la = a.loc?.line ?? 0, lb = b.loc?.line ?? 0;
      if (la !== lb) return la - lb;
      const ca = a.loc?.column ?? 0, cb = b.loc?.column ?? 0;
      return ca - cb;
    });

  const baselineLabel = report.minLevel === "high" ? "High" : "Low";

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analysis Results</h1>
            <p className="mt-1 text-sm text-slate-600">
              Input language: <span className="font-medium">{report.inputLanguage}</span> ·
              Minimum Baseline: <span className="font-medium">{baselineLabel}</span>
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Checked: <span className="font-medium">{report.summary.totalChecked}</span> ·
              Below min level: <span className="font-medium">{report.summary.belowMinLevel}</span>
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="shrink-0 rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Back to Editor
          </button>
        </div>

        {/* Issues table */}
        <div className="mt-8 overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/80">
              <tr className="text-slate-600">
                <th className="px-4 py-3 font-semibold">Severity</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Kind</th>
                <th className="px-4 py-3 font-semibold">Property</th>
                <th className="px-4 py-3 font-semibold">Value</th>
                <th className="px-4 py-3 font-semibold">BCD key</th>
                <th className="px-4 py-3 font-semibold">Feature</th>
                <th className="px-4 py-3 font-semibold">Detected Baseline</th>
                <th className="px-4 py-3 font-semibold">Support (major)</th>
              </tr>
            </thead>
            <tbody>
              {scored.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-slate-500">
                    No issues found below the chosen minimum baseline.
                  </td>
                </tr>
              ) : (
                scored.map((iss, i) => (
                  <tr key={`${iss.bcdKey}-${iss.loc?.line}-${iss.loc?.column}-${i}`} className="border-t">
                    <td className="px-4 py-2 align-top">
                      <SeverityBadge s={iss.severity} />
                    </td>
                    <td className="px-4 py-2 align-top">
                      {iss.loc ? `L${iss.loc.line}:C${iss.loc.column}` : "—"}
                    </td>
                    <td className="px-4 py-2 align-top">{iss.kind}</td>
                    <td className="px-4 py-2 align-top font-mono">{iss.property}</td>
                    <td className="px-4 py-2 align-top font-mono">{iss.value ?? "—"}</td>
                    <td className="px-4 py-2 align-top font-mono text-[12px]">{iss.bcdKey}</td>
                    <td className="px-4 py-2 align-top text-[12px]">{iss.featureId ?? "—"}</td>
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

        {/* Optional: raw JSON for debugging */}
        {/* <pre className="mt-6 text-xs bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
          {JSON.stringify(report, null, 2)}
        </pre> */}
      </div>
    </div>
  );
}
