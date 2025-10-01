import { parse } from "@babel/parser";
import traverse, { NodePath, Scope } from "@babel/traverse";
import * as t from "@babel/types";
import {
  type BaselineReport,
  type BaselineMinLevel,
  type BaselineIssue,
} from "./BaseLineChecker";
import { analyzeCssString } from "./analyseCSS";
import { analyzeJsString } from "./analyseJavaScript";

/** Toggle for local debugging */
const DEBUG = true;

/** If true, we will try to run the plain-JS analyzer after JSX analysis —
 * but ONLY when the code looks like plain JS (no JSX and no ESM). */
const RUN_JS_FALLBACK_SAFELY = true;

/** Convert camelCase or PascalCase to kebab-case */
function toKebabCase(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}

/** Extract cooked text from a TemplateLiteral and keep placeholders for expressions */
function extractTemplateLiteral(tpl: t.TemplateLiteral): string {
  const parts: string[] = [];
  tpl.quasis.forEach((q, i) => {
    parts.push(q.value.cooked ?? "");
    if (i < tpl.expressions.length) {
      // Keep a placeholder so CSS structure remains intact for the analyzer
      parts.push("/* expr */");
    }
  });
  return parts.join("");
}

/** Best-effort: turn a JS expression into a plain string for CSS extraction */
function extractStringFromExpression(expr: t.Expression): string | null {
  if (t.isStringLiteral(expr)) return expr.value;
  if (t.isTemplateLiteral(expr)) return extractTemplateLiteral(expr);
  if (t.isBinaryExpression(expr) && expr.operator === "+") {
    const left = t.isExpression(expr.left)
      ? extractStringFromExpression(expr.left)
      : null;
    const right = t.isExpression(expr.right)
      ? extractStringFromExpression(expr.right)
      : null;
    if (left !== null && right !== null) return left + right;
  }
  return null;
}

/** Try to resolve a simple identifier to an ObjectExpression in the same file */
function resolveIdentifierToObjectExpression(
  id: t.Identifier,
  scope: Scope
): t.ObjectExpression | null {
  const binding = scope.getBinding(id.name);
  if (!binding) return null;
  const node = binding.path.node;
  if (t.isVariableDeclarator(node)) {
    const init = node.init;
    return init && t.isObjectExpression(init) ? init : null;
  }
  return null;
}

/** Serialize a React style object into CSS text (best-effort) */
function serializeStyleObjectToCss(obj: t.ObjectExpression): string {
  const lines: string[] = [];
  for (const prop of obj.properties) {
    if (!t.isObjectProperty(prop)) continue;
    let key = "";
    if (t.isIdentifier(prop.key)) key = prop.key.name;
    else if (t.isStringLiteral(prop.key)) key = prop.key.value;
    if (!key) continue;

    const cssName = toKebabCase(key);
    const v = prop.value;

    if (t.isStringLiteral(v)) {
      lines.push(`${cssName}: ${v.value};`);
      continue;
    }
    if (t.isNumericLiteral(v)) {
      lines.push(`${cssName}: ${String(v.value)};`);
      continue;
    }
    if (t.isTemplateLiteral(v)) {
      lines.push(`${cssName}: ${extractTemplateLiteral(v)};`);
      continue;
    }
    if (t.isArrayExpression(v)) {
      const vals = v.elements
        .map((el) => {
          if (!el) return null;
          if (t.isStringLiteral(el)) return el.value;
          if (t.isNumericLiteral(el)) return String(el.value);
          if (t.isTemplateLiteral(el)) return extractTemplateLiteral(el);
          return "/* expr */";
        })
        .filter((x): x is string => Boolean(x))
        .join(" ");
      if (vals) lines.push(`${cssName}: ${vals};`);
      continue;
    }
    if (t.isIdentifier(v)) {
      lines.push(`${cssName}: /* expr */;`);
      continue;
    }
    if (t.isObjectExpression(v)) {
      lines.push(`/* nested style object for ${cssName} ignored */`);
      continue;
    }
    if (
      t.isCallExpression(v) ||
      t.isArrowFunctionExpression(v) ||
      t.isFunctionExpression(v)
    ) {
      lines.push(`${cssName}: /* expr */;`);
      continue;
    }
    lines.push(`${cssName}: /* unsupported */;`);
  }
  if (DEBUG)
    console.log(
      "[DEBUG] serializeStyleObjectToCss output:\n",
      lines.join("\n")
    );
  return lines.join("\n");
}

/** Collect CSS string from a JSX <style> node */
function collectStyleTagCss(path: NodePath<t.JSXElement>): string {
  const opening = path.node.openingElement;

  // dangerouslySetInnerHTML={{ __html: "..." }}
  const dih = opening.attributes.find(
    (attr) =>
      t.isJSXAttribute(attr) &&
      t.isJSXIdentifier(attr.name, { name: "dangerouslySetInnerHTML" })
  ) as t.JSXAttribute | undefined;

  if (
    dih &&
    dih.value &&
    t.isJSXExpressionContainer(dih.value) &&
    t.isObjectExpression(dih.value.expression)
  ) {
    const obj = dih.value.expression;
    const htmlProp = obj.properties.find(
      (p) =>
        t.isObjectProperty(p) &&
        ((t.isIdentifier(p.key) && p.key.name === "__html") ||
          (t.isStringLiteral(p.key) && p.key.value === "__html"))
    ) as t.ObjectProperty | undefined;
    if (htmlProp) {
      const v = htmlProp.value;
      if (t.isStringLiteral(v)) return v.value;
      if (t.isTemplateLiteral(v)) return extractTemplateLiteral(v);
      if (t.isExpression(v)) {
        const str = extractStringFromExpression(v);
        if (str !== null) return str;
      }
    }
  }

  // Children content
  const parts: string[] = [];
  for (const child of path.node.children) {
    if (t.isJSXText(child)) {
      parts.push(child.value);
      continue;
    }
    if (t.isJSXExpressionContainer(child)) {
      const expr = child.expression;
      if (t.isStringLiteral(expr)) {
        parts.push(expr.value);
        continue;
      }
      if (t.isTemplateLiteral(expr)) {
        parts.push(extractTemplateLiteral(expr));
        continue;
      }
      if (t.isExpression(expr)) {
        const str = extractStringFromExpression(expr);
        if (str !== null) {
          parts.push(str);
          continue;
        }
      }
    }
  }

  const css = parts.join("\n");
  if (DEBUG) console.log("[DEBUG] <style> extracted CSS:\n", css);
  return css;
}

/** Analyze JSX/TSX: JS + inline CSS + styled-components + <style> tags + emotion css prop */
export function analyzeJsxString(
  code: string,
  minLevel: BaselineMinLevel = "high"
): BaselineReport {
  if (DEBUG) console.log("[DEBUG] analyzeJsxString input:\n", code);

  let ast: t.File;
  try {
    ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    }) as t.File;
    if (DEBUG) console.log("[DEBUG] Parse success");
  } catch (err) {
    console.warn("[Baseline] JSX parse failed:", err);
    return {
      inputLanguage: "jsx",
      minLevel,
      issues: [],
      summary: { totalChecked: 0, belowMinLevel: 0 },
    };
  }

  const jsReports: BaselineReport[] = [];
  const cssReports: BaselineReport[] = [];

  // Flags to decide later whether to run plain-JS analyzer safely
  let sawJsx = false;
  let sawEsm = false;

  traverse(ast, {
    Program(path) {
      // mark ESM if there are Import/Export declarations
      for (const n of path.node.body) {
        if (
          t.isImportDeclaration(n) ||
          t.isExportNamedDeclaration(n) ||
          t.isExportDefaultDeclaration(n) ||
          t.isExportAllDeclaration(n)
        ) {
          sawEsm = true;
        }
      }
    },

    JSXElement(path: NodePath<t.JSXElement>) {
      sawJsx = true;
      const opening = path.node.openingElement;
      if (t.isJSXIdentifier(opening.name)) {
        if (DEBUG) console.log("[DEBUG] JSXElement <", opening.name.name, ">");
        if (opening.name.name === "style") {
          const cssCode = collectStyleTagCss(path);
          if (cssCode.trim()) {
            cssReports.push(analyzeCssString(cssCode, minLevel));
          }
        }
      }
    },

    /**
     * styled-components & emotion tagged templates:
     *   styled.*`...`, styled('div')`...`, styled(Component)`...`, css`...`
     */
    TaggedTemplateExpression(path: NodePath<t.TaggedTemplateExpression>) {
      if (DEBUG) console.log("[DEBUG] TaggedTemplateExpression found");
      const tag = path.node.tag;

      const isStyledMember =
        t.isMemberExpression(tag) &&
        t.isIdentifier(tag.object) &&
        tag.object.name === "styled";

      const isStyledCall =
        t.isCallExpression(tag) &&
        t.isIdentifier(tag.callee) &&
        tag.callee.name === "styled";

      const isStyledIdentifier = t.isIdentifier(tag) && tag.name === "styled";
      const isEmotionCss = t.isIdentifier(tag) && tag.name === "css";

      const isStyledAttrsChain =
        t.isMemberExpression(tag) &&
        t.isMemberExpression(tag.object) &&
        t.isIdentifier(tag.object.object) &&
        tag.object.object.name === "styled";

      if (
        isStyledMember ||
        isStyledCall ||
        isStyledIdentifier ||
        isStyledAttrsChain ||
        isEmotionCss
      ) {
        const cssCode = extractTemplateLiteral(path.node.quasi);
        if (DEBUG)
          console.log("[DEBUG] Styled/Emotion CSS extracted:\n", cssCode);
        if (cssCode.trim()) cssReports.push(analyzeCssString(cssCode, minLevel));
      }
    },

    /**
     * JSX attributes: inline style object + Emotion css prop (object/template/string)
     */
    JSXAttribute(path: NodePath<t.JSXAttribute>) {
      if (!t.isJSXIdentifier(path.node.name)) return;
      const attrName = path.node.name.name;
      if (DEBUG) console.log("[DEBUG] JSXAttribute:", attrName);

      // inline style={{ ... }}
      if (attrName === "style") {
        const val = path.node.value;
        if (val && t.isJSXExpressionContainer(val)) {
          let expr = val.expression;
          // resolve identifier if possible
          if (t.isIdentifier(expr)) {
            const resolved = resolveIdentifierToObjectExpression(
              expr,
              path.scope
            );
            if (resolved) expr = resolved;
          }
          if (t.isObjectExpression(expr)) {
            const cssText = serializeStyleObjectToCss(expr);
            if (cssText.trim())
              cssReports.push(analyzeCssString(cssText, minLevel));
          }
        }
        return;
      }

      // emotion css prop
      if (attrName === "css") {
        const val = path.node.value;
        if (!val || !t.isJSXExpressionContainer(val)) return;

        const expr = val.expression;
        if (t.isTemplateLiteral(expr)) {
          const cssCode = extractTemplateLiteral(expr);
          if (DEBUG) console.log("[DEBUG] css prop (template):\n", cssCode);
          if (cssCode.trim()) cssReports.push(analyzeCssString(cssCode, minLevel));
        } else if (t.isObjectExpression(expr)) {
          const cssText = serializeStyleObjectToCss(expr);
          if (DEBUG) console.log("[DEBUG] css prop (object):\n", cssText);
          if (cssText.trim()) cssReports.push(analyzeCssString(cssText, minLevel));
        } else {
          const str = t.isExpression(expr)
            ? extractStringFromExpression(expr)
            : null;
          if (DEBUG) console.log("[DEBUG] css prop (string):\n", str);
          if (str && str.trim()) cssReports.push(analyzeCssString(str, minLevel));
        }
      }
    },
  });

  // SAFETY: Only run plain JS analyzer if it looks like "plain JS".
  // - If file contains JSX -> skip (Acorn/walk may need JSX handlers).
  // - If file uses ESM (imports/exports) -> depending on your analyzeJsString setup, skip to avoid parse mode issues.
  const looksLikePlainJs = !sawJsx && !sawEsm;

  if (RUN_JS_FALLBACK_SAFELY && looksLikePlainJs) {
    try {
      if (DEBUG) console.log("[DEBUG] Running plain JS analyzer (safe mode).");
      jsReports.push(analyzeJsString(code, minLevel));
    } catch (e) {
      console.warn("[Baseline] analyzeJsString failed:", e);
    }
  } else {
    if (DEBUG) {
      console.log(
        "[DEBUG] Skipping plain JS analyzer.",
        JSON.stringify({ sawJsx, sawEsm, RUN_JS_FALLBACK_SAFELY })
      );
    }
  }

  // Merge results
  const allIssues: BaselineIssue[] = [
    ...jsReports.flatMap((r) => r.issues),
    ...cssReports.flatMap((r) => r.issues),
  ];

  const totalChecked =
    jsReports.reduce((s, r) => s + r.summary.totalChecked, 0) +
    cssReports.reduce((s, r) => s + r.summary.totalChecked, 0);

  if (DEBUG) {
    console.log("[DEBUG] Total issues found:", allIssues.length);
    console.log("[DEBUG] All issues:", allIssues);
  }

  return {
    inputLanguage: "jsx",
    minLevel,
    issues: allIssues,
    summary: { totalChecked, belowMinLevel: allIssues.length },
  };
}

/** Demo component with a non-baseline property to assert extraction works */
export const AnimatedArticle = () => {
  return (
    <article>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .article {
            animation: fadeIn 1s linear;
            animation-timeline: scroll(root);
          }
        `}
      </style>
      <div className="article">Hello world with scroll animation</div>
    </article>
  );
};
