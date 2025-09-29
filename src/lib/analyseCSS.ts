import {BaselineChecker, type BaselineMinLevel, type BaselineReport} from "./BaseLineChecker";

/** Safely run Baseline analysis over a CSS string. */
export function analyzeCssString(
  css: string,
  minLevel: BaselineMinLevel = "high"
): BaselineReport {
  try {
    const checker = new BaselineChecker({ minLevel });
    return checker.analyzeCSS(css);
  } catch (err) {
    console.error("[Baseline] analyzeCssString failed:", err);
    return {
      inputLanguage: "css",
      minLevel,
      issues: [],
      summary: { totalChecked: 0, belowMinLevel: 0 },
    };
  }
}
