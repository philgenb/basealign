import React from "react";

interface AccessibilityScoreProps {
  score: number; // 0 - 100
}

export const AccessibilityScore: React.FC<AccessibilityScoreProps> = ({ score }) => {
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div>
      <div className="flex justify-between mb-1">
        {/*<span className="text-sm font-medium text-[#7B96E8]">{clamped}%</span>*/}
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden w-48">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${clamped}%`, backgroundColor: "#7B96E8" }}
        />
      </div>
    </div>
  );
};
