import axe from "axe-core";

export type AccessibilityIssue = {
    id: string;                 // unique identifier (e.g., axe rule id or custom id)
    message: string;            // human-readable description
    impact: "critical" | "serious" | "moderate" | "minor" | "unknown"; // from axe or custom mapping
};

/**
 * Quick static heuristic without axe-core.
 * Runs a few simple regex-based checks on the HTML string.
 */
export function analyzeAccessibility(
    code: string
): { issues: AccessibilityIssue[]; score: number } {
    const issues: AccessibilityIssue[] = [];

    // 1. <img> without alt attribute
    const imgWithoutAlt = code.match(/<img(?![^>]*alt=)[^>]*>/gi);
    if (imgWithoutAlt) {
        issues.push({
            id: "img-alt",
            message: "Image elements must have an alt attribute.",
            impact: "critical",
        });
    }

    // 2. <button> with no text content
    const emptyButtons = code.match(/<button[^>]*>\s*<\/button>/gi);
    if (emptyButtons) {
        issues.push({
            id: "button-text",
            message: "Buttons should have descriptive text.",
            impact: "critical",
        });
    }

    // 3. <a> without href
    const emptyLinks = code.match(/<a(?![^>]*href=)[^>]*>.*<\/a>/gi);
    if (emptyLinks) {
        issues.push({
            id: "link-href",
            message: "Links must have an href attribute.",
            impact: "moderate",
        });
    }

    // 4. Simplified inline style contrast check
    if (code.includes("color: #fff") && code.includes("background: #fff")) {
        issues.push({
            id: "contrast",
            message: "Text color and background should have sufficient contrast.",
            impact: "minor",
        });
    }

    // --- scoring heuristic ---
    const base = 100;
    const deductions = issues.reduce((sum, i) => {
        switch (i.impact) {
            case "critical":
            case "serious":
                return sum + 20;
            case "moderate":
                return sum + 10;
            case "minor":
                return sum + 5;
            default:
                return sum + 5;
        }
    }, 0);

    const score = Math.max(0, base - deductions);

    return {issues, score};
}

/**
 * Detailed accessibility analysis with axe-core.
 * Injects the provided code into a temporary DOM container and runs axe.
 */
export async function analyzeAccessibilityWithAxe(
    code: string
): Promise<{ issues: AccessibilityIssue[]; score: number }> {
    const container = document.createElement("div");
    container.innerHTML = code;
    document.body.appendChild(container);

    const results = await axe.run(container);

    const issues: AccessibilityIssue[] = results.violations.map((v) => ({
        id: v.id,
        message: v.help,
        impact: (v.impact as AccessibilityIssue["impact"]) ?? "unknown",
    }));

    // --- scoring heuristic ---
    // Simple approach: each violation reduces the score by 10 points
    const score = Math.max(0, 100 - issues.length * 10);

    document.body.removeChild(container);

    return {issues, score};
}
