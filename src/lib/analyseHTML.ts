import {BaselineChecker, type BaselineMinLevel, type BaselineReport} from "./BaseLineChecker";

/** Safely run Baseline analysis over an HTML string. */
export function analyzeHtmlString(
  html: string,
  minLevel: BaselineMinLevel = "high"
): BaselineReport {
  try {
    const checker = new BaselineChecker({ minLevel });
    return checker.analyzeHTML(html);
  } catch (err) {
    console.error("[Baseline] analyzeHtmlString failed:", err);
    return {
      inputLanguage: "html",
      minLevel,
      issues: [],
      summary: { totalChecked: 0, belowMinLevel: 0 },
    };
  }
}