import * as parse5 from "parse5";
import {
  type BaselineReport,
  type BaselineMinLevel,
  type BaselineIssue
} from "./BaseLineChecker";
import {analyzeHtmlString} from "./analyseHTML";
import {analyzeCssString} from "./analyseCSS";
import {analyzeJsString} from "./analyseJavaScript";

/**
 * Analyze HTML that may include <style> and <script>.
 * - HTML elements & attributes
 * - Inline <style> blocks → CSS analyzer
 * - Inline <script> blocks → JS analyzer
 */
export function analyzeMixedString(
  code: string,
  minLevel: BaselineMinLevel = "high"
): BaselineReport {
  let htmlAst;
  try {
    htmlAst = parse5.parse(code, { sourceCodeLocationInfo: true });
  } catch (err) {
    console.warn("[Baseline] Mixed parse failed:", err);
    return {
      inputLanguage: "mixed",
      minLevel,
      issues: [],
      summary: { totalChecked: 0, belowMinLevel: 0 }
    };
  }

  const htmlReport = analyzeHtmlString(code, minLevel);
  const cssReports: BaselineReport[] = [];
  const jsReports: BaselineReport[] = [];

  function walk(node: any) {
    // CSS in <style>
    if (node.nodeName === "style" && node.childNodes?.length > 0) {
      const cssCode = node.childNodes.map((c: any) => c.value || "").join("");
      if (cssCode.trim()) {
        cssReports.push(analyzeCssString(cssCode, minLevel));
      }
    }

    // JS in <script>
    if (node.nodeName === "script" && node.childNodes?.length > 0) {
      const jsCode = node.childNodes.map((c: any) => c.value || "").join("");
      if (jsCode.trim()) {
        jsReports.push(analyzeJsString(jsCode, minLevel));
      }
    }

    if (node.childNodes) {
      node.childNodes.forEach(walk);
    }
  }

  walk(htmlAst);

  // Merge results
  const allIssues: BaselineIssue[] = [
    ...htmlReport.issues,
    ...cssReports.flatMap(r => r.issues),
    ...jsReports.flatMap(r => r.issues)
  ];

  const totalChecked =
    htmlReport.summary.totalChecked +
    cssReports.reduce((s, r) => s + r.summary.totalChecked, 0) +
    jsReports.reduce((s, r) => s + r.summary.totalChecked, 0);

  return {
    inputLanguage: "mixed",
    minLevel,
    issues: allIssues,
    summary: { totalChecked, belowMinLevel: allIssues.length }
  };
}
