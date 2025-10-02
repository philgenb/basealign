import axe from "axe-core";

/**
 * Detailed accessibility analysis with axe-core.
 * Injects the provided code into a temporary DOM container and runs axe.
 */
let axeRunning = false;

export async function analyzeAccessibilityWithAxe(code: string) {
    if (axeRunning) {
        return new Promise<{ issues: any[]; score: number }>((resolve, reject) => {
            const interval = setInterval(() => {
                if (!axeRunning) {
                    clearInterval(interval);
                    analyzeAccessibilityWithAxe(code).then(resolve).catch(reject);
                }
            }, 50);
        });
    }

    axeRunning = true;
    try {
        const container = document.createElement("div");
        container.innerHTML = code;
        document.body.appendChild(container);

        const results = await axe.run(container);

        const issues = results.violations.map((v) => ({
            id: v.id,
            message: v.help,
            impact: v.impact ?? "unknown",
        }));

        const score = Math.max(0, 100 - issues.length * 10);

        document.body.removeChild(container);
        return {issues, score};
    } finally {
        axeRunning = false;
    }
}

