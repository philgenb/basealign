import {BaselineChecker, type BaselineMinLevel, type BaselineReport} from "./BaseLineChecker";

/** Safely run Baseline analysis over a JS string. */
export function analyzeJsString(
  js: string,
  minLevel: BaselineMinLevel = "high"
): BaselineReport {
  try {
    const checker = new BaselineChecker({ minLevel });
    return checker.analyzeJS(js);
  } catch (err) {
    console.error("[Baseline] analyzeJsString failed:", err);
    return {
      inputLanguage: "js",
      minLevel,
      issues: [],
      summary: { totalChecked: 0, belowMinLevel: 0 },
    };
  }
}