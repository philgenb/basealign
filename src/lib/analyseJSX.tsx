import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import {
  type BaselineReport,
  type BaselineMinLevel,
  type BaselineIssue
} from "./BaseLineChecker";
import {analyzeCssString} from "./analyseCSS";
import {analyzeJsString} from "./analyseJavaScript";

/**
 * Analyze JSX/TSX: combines JS + inline CSS (style={{…}}) + styled-components.
 */
export function analyzeJsxString(
  code: string,
  minLevel: BaselineMinLevel = "high"
): BaselineReport {
  let ast;
  try {
    ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"]
    });
  } catch (err) {
    console.warn("[Baseline] JSX parse failed:", err);
    return {
      inputLanguage: "jsx",
      minLevel,
      issues: [],
      summary: { totalChecked: 0, belowMinLevel: 0 }
    };
  }

  const jsReports: BaselineReport[] = [];
  const cssReports: BaselineReport[] = [];

  traverse(ast, {
    // styled-components: styled.div`...`
    TaggedTemplateExpression(path) {
      const tag = path.node.tag;
      if (
        tag.type === "MemberExpression" &&
        tag.object.type === "Identifier" &&
        tag.object.name === "styled"
      ) {
        const cssCode = path.node.quasi.quasis.map(q => q.value.cooked).join("");
        if (cssCode.trim()) {
          cssReports.push(analyzeCssString(cssCode, minLevel));
        }
      }
    },

    // Inline styles: style={{ color: "red" }}
    JSXAttribute(path) {
      if (path.node.name.name === "style") {
        const val = path.node.value;
        if (val?.type === "JSXExpressionContainer") {
          const expr = val.expression;
          if (expr.type === "ObjectExpression") {
            const cssText = expr.properties
              .map((prop: any) => {
                if (prop.key?.name && prop.value?.value) {
                  return `${prop.key.name}: ${prop.value.value};`;
                }
                return "";
              })
              .join("\n");
            if (cssText.trim()) {
              cssReports.push(analyzeCssString(cssText, minLevel));
            }
          }
        }
      }
    }
  });

  // Always run full JS analysis as fallback
  jsReports.push(analyzeJsString(code, minLevel));

  // Merge results
  const allIssues: BaselineIssue[] = [
    ...jsReports.flatMap(r => r.issues),
    ...cssReports.flatMap(r => r.issues)
  ];

  const totalChecked =
    jsReports.reduce((s, r) => s + r.summary.totalChecked, 0) +
    cssReports.reduce((s, r) => s + r.summary.totalChecked, 0);

  return {
    inputLanguage: "jsx",
    minLevel,
    issues: allIssues,
    summary: { totalChecked, belowMinLevel: allIssues.length }
  };
}
