import * as csstree from "css-tree";
import data from "web-features/data.json" with { type: "json" };
import { getStatus } from "compute-baseline";

const { features: WEB_FEATURES } = data;

export type BaselineLevel = false | "low" | "high";
export type BaselineMinLevel = "low" | "high";

export type BaselineIssue = {
  kind: "property" | "property-value";
  property: string;
  value?: string;
  bcdKey: string;
  featureId: string | null;
  detectedBaseline: BaselineLevel;
  baselineLowDate?: string;
  baselineHighDate?: string;
  loc?: { line: number; column: number };
  support?: Record<string, string>;
};

export type BaselineReport = {
  inputLanguage: "css";
  minLevel: BaselineMinLevel;
  issues: BaselineIssue[];
  summary: { totalChecked: number; belowMinLevel: number };
};

// compute-baseline result
type ComputeBaselineStatus = {
  baseline: BaselineLevel;
  baseline_low_date?: string;
  baseline_high_date?: string;
  support?: Record<string, string>;
};

// Feature object from web-features JSON
type WebFeature = {
  kind: "feature" | "moved" | "split";
  name?: string;
  description?: string;
  group?: string | string[];
  compat_features?: string[];
  status?: {
    baseline: BaselineLevel;
    baseline_low_date?: string;
    baseline_high_date?: string;
    support?: Record<string, string>;
  };
};

export class BaselineChecker {
  private minLevel: BaselineMinLevel;
  private bcdToFeature: Map<string, string>;

  constructor(opts?: { minLevel?: BaselineMinLevel }) {
    this.minLevel = opts?.minLevel ?? "high";
    this.bcdToFeature = this.buildReverseIndex();
  }

  /** Build reverse index: BCD key -> web-features feature id */
  private buildReverseIndex(): Map<string, string> {
    const idx = new Map<string, string>();
    for (const [featureId, feat] of Object.entries(WEB_FEATURES as Record<string, WebFeature>)) {
      if (feat.kind === "feature" && Array.isArray(feat.compat_features)) {
        for (const k of feat.compat_features) {
          idx.set(k, featureId);
        }
      }
    }
    return idx;
  }

  private meetsMin(b: BaselineLevel): boolean {
    return this.minLevel === "high" ? b === "high" : b === "low" || b === "high";
  }

  analyzeCSS(cssText: string): BaselineReport {
    let ast: csstree.CssNode;
    try {
      ast = csstree.parse(cssText, {
        positions: true,
        parseValue: true,
        parseCustomProperty: true,
      });
    } catch (err) {
      console.warn("[Baseline] CSS parse failed:", err);
      return {
        inputLanguage: "css",
        minLevel: this.minLevel,
        issues: [],
        summary: { totalChecked: 0, belowMinLevel: 0 },
      };
    }

    const issues: BaselineIssue[] = [];
    const seen = new Set<string>();
    let totalChecked = 0;

    csstree.walk(ast, {
      visit: "Declaration",
      enter: (node) => {
        if (node.type !== "Declaration") return;
        const decl = node;

        const prop = decl.property.toLowerCase().trim();
        const propLoc =
          decl.loc?.start ? { line: decl.loc.start.line, column: decl.loc.start.column } : undefined;

        // 1) property-level BCD key
        const propBcd = `css.properties.${prop}`;
        totalChecked += 1;
        this.checkBcdKey(
          propBcd,
          propLoc,
          { kind: "property", property: prop },
          issues,
          seen
        );

        // 2) value-level identifiers
        try {
          csstree.walk(decl.value as unknown as csstree.CssNode, {
            visit: "Identifier",
            enter: (idNode) => {
              if (idNode.type !== "Identifier") return;
              const ident = idNode.name.toLowerCase();
              if (!ident || ident.startsWith("--")) return;

              const valueBcd = `css.properties.${prop}.${ident}`;
              const dedupeKey = `${valueBcd}@${propLoc?.line}:${propLoc?.column}`;
              if (seen.has(dedupeKey)) return;

              totalChecked += 1;
              this.checkBcdKey(
                valueBcd,
                propLoc,
                { kind: "property-value", property: prop, value: ident },
                issues,
                seen
              );
            },
          });
        } catch {
          // ignore malformed values
        }
      },
    });

    return {
      inputLanguage: "css",
      minLevel: this.minLevel,
      issues,
      summary: { totalChecked, belowMinLevel: issues.length },
    };
  }

  private checkBcdKey(
    bcdKey: string,
    loc: BaselineIssue["loc"],
    meta: { kind: BaselineIssue["kind"]; property: string; value?: string },
    out: BaselineIssue[],
    seen: Set<string>
  ) {
    const featureId = this.bcdToFeature.get(bcdKey) ?? null;

    let status: ComputeBaselineStatus | null = null;
    try {
      if (featureId) {
        status = getStatus(featureId, bcdKey) as ComputeBaselineStatus;
      } else {
        // Some keys may not map to a feature id
        const fid = featureId ?? "";
        status = getStatus(fid, bcdKey) as ComputeBaselineStatus;
      }
    } catch {
      status = null;
    }

    const baseline: BaselineLevel = status?.baseline ?? false;
    if (this.meetsMin(baseline)) return;

    const dedupeKey = `${bcdKey}@${loc?.line}:${loc?.column}`;
    if (seen.has(dedupeKey)) return;

    out.push({
      kind: meta.kind,
      property: meta.property,
      value: meta.value,
      bcdKey,
      featureId,
      detectedBaseline: baseline,
      baselineLowDate: status?.baseline_low_date,
      baselineHighDate: status?.baseline_high_date,
      support: status?.support,
      loc,
    });
    seen.add(dedupeKey);
  }
}
