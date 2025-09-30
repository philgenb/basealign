export type AccessibilityIssue = {
  type: string;
  message: string;
  severity: "critical" | "warning";
};

export function analyzeAccessibility(code: string): {
  issues: AccessibilityIssue[];
  score: number;
} {
  const issues: AccessibilityIssue[] = [];

  // 1. Check for <img> without alt
  const imgWithoutAlt = code.match(/<img(?![^>]*alt=)[^>]*>/gi);
  if (imgWithoutAlt) {
    issues.push({
      type: "img-alt",
      message: "Image elements must have an alt attribute.",
      severity: "critical",
    });
  }

  // 2. Check for buttons/links without text
  const emptyButtons = code.match(/<button[^>]*>\s*<\/button>/gi);
  if (emptyButtons) {
    issues.push({
      type: "button-text",
      message: "Buttons should have descriptive text.",
      severity: "critical",
    });
  }

  // 3. Check for <a> without href or text
  const emptyLinks = code.match(/<a(?![^>]*href=)[^>]*>.*<\/a>/gi);
  if (emptyLinks) {
    issues.push({
      type: "link-href",
      message: "Links must have an href attribute.",
      severity: "warning",
    });
  }

  // 4. Check for inline styles with low contrast (simplified)
  if (code.includes("color: #fff") && code.includes("background: #fff")) {
    issues.push({
      type: "contrast",
      message: "Text color and background should have sufficient contrast.",
      severity: "warning",
    });
  }

  // --- scoring heuristic ---
  const base = 100;
  const deductions = issues.reduce((sum, i) => {
    return sum + (i.severity === "critical" ? 20 : 10);
  }, 0);

  const score = Math.max(0, base - deductions);

  return { issues, score };
}
