import React, { useEffect, useState } from "react";
import axe from "axe-core";

interface AccessibilityScoreCardProps {
  htmlSnippet: string;
}

export const AccessibilityScoreCard: React.FC<AccessibilityScoreCardProps> = ({ htmlSnippet }) => {
  const [score, setScore] = useState<number | null>(null);
  const [violations, setViolations] = useState<axe.Result[]>([]);

  useEffect(() => {
    if (!htmlSnippet.trim()) return;

    const container = document.createElement("div");
    container.innerHTML = htmlSnippet;
    document.body.appendChild(container);

    axe.run(container, {}, (err, results) => {
      if (err) {
        console.error("axe-core error:", err);
        return;
      }

      const total = results.passes.length + results.violations.length;
      const calcScore = total === 0 ? 100 : Math.round((results.passes.length / total) * 100);

      setScore(calcScore);
      setViolations(results.violations);

      document.body.removeChild(container);
    });
  }, [htmlSnippet]);

  return (
    <div className="rounded-2xl border border-card shadow-card bg-white p-6">
      <h2 className="text-lg font-bold font-jakarta text-primary mb-4">Accessibility Score</h2>

      {score === null ? (
        <p className="text-slate-500 text-sm">Analyzing…</p>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden mb-3">
            <div
              className={`h-4 transition-all ${
                score > 80 ? "bg-green-500" : score > 50 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-sm text-slate-700 font-medium">{score}% compliance with WCAG</p>

          {/* Violations List */}
          {violations.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-800">Found Issues:</h3>
              <ul className="list-disc pl-5 text-sm text-slate-600 mt-2 space-y-1">
                {violations.map((v, i) => (
                  <li key={i}>
                    {v.id} — {v.impact}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};
