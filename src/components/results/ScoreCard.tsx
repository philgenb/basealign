import React, {useEffect, useState} from "react";

type ScoreCardProps = {
    score: number; // 0–100
    segments?: { color: string; value: number }[];
};

export const ScoreCard: React.FC<ScoreCardProps> = ({
                                                        score,
                                                        segments = [
                                                            {color: "#FF7072", value: 20}, // red error
                                                            {color: "#FFDB70", value: 10}, // orange warning
                                                            {color: "#5CBC4B", value: 70}, // green ok
                                                        ],
                                                    }) => {
    const target = Math.max(0, Math.min(100, Math.round(score)));
    const [animated, setAnimated] = useState(0);

    // Animate from 0 -> target
    useEffect(() => {
        let frame: number;
        const duration = 1000;
        const start = performance.now();

        const step = (ts: number) => {
            const progress = Math.min((ts - start) / duration, 1);
            setAnimated(Math.floor(progress * target));
            if (progress < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [target]);

    // Build conic-gradient string
    let angle = 0;
    const stops: string[] = [];
    for (const s of segments) {
        const start = angle;
        angle += s.value * 3.6; // value in %
        stops.push(`${s.color} ${start}deg ${angle}deg`);
    }
    const bg = `conic-gradient(${stops.join(", ")})`;

    return (
        <div className="bg-white font-jakarta font-extrabold tracking-tighter rounded-2xl border px-16 py-8 gap-2 border-card shadow-card flex flex-col items-start">
            <div className="text-[#D7D7D7] font-extrabold text-lg mb-2">Overall Score</div>
            <div className="flex items-center gap-4">
                {/* Donut chart */}
                <div
                    className="h-14 w-14 rounded-full flex items-center justify-center"
                    style={{background: bg}}
                >
                    <div className="h-6 w-6 bg-white rounded-full"/>
                </div>
                {/* Animated score */}
                <div className="text-5xl text-[#202122]">
                    {animated}
                    <span className="ml-1 text-4xl text-[#D7D7D7]">%</span>
                </div>
            </div>
        </div>
    );
};
