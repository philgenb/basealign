import {type BaselineReport, type BaselineMinLevel} from "./BaseLineChecker";
import {analyzeCssString} from "./analyseCSS";
import {analyzeHtmlString} from "./analyseHTML";
import {analyzeJsString} from "./analyseJavaScript";
import {analyzeJsxString} from "./analyseJSX";
import {analyzeMixedString} from "./analyseMixed";

export function analyzeCodeString(
    code: string,
    detectedLang: string,
    minLevel: BaselineMinLevel = "high"
): BaselineReport {
    try {
        switch (detectedLang) {
            case "css":
                return analyzeCssString(code, minLevel);

            case "html":
                // check for embedded code
                if (code.includes("<style") || code.includes("<script")) {
                    return analyzeMixedString(code, minLevel);
                }
                return analyzeHtmlString(code, minLevel);

            case "javascript":
            case "typescript": {
                if (code.includes("<") && code.includes("/>")) {
                    return analyzeJsxString(code, minLevel);
                }
                return analyzeJsString(code, minLevel);
            }

            default:
                return {
                    inputLanguage: detectedLang as any,
                    minLevel,
                    issues: [],
                    summary: {totalChecked: 0, belowMinLevel: 0},
                };
        }
    } catch (err) {
        console.error("[Baseline] analyzeCodeString failed:", err);
        return {
            inputLanguage: detectedLang as any,
            minLevel,
            issues: [],
            summary: {totalChecked: 0, belowMinLevel: 0},
        };
    }
}
