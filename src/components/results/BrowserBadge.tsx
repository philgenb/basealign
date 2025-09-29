import React from "react";

type BrowserName = "chrome" | "firefox" | "safari";

export const BrowserBadge: React.FC<{ name: BrowserName }> = ({ name }) => {
  const map = {
    chrome: { label: "Chrome", bg: "bg-emerald-50", text: "text-emerald-700" },
    firefox: { label: "Firefox", bg: "bg-orange-50", text: "text-orange-700" },
    safari: { label: "Safari", bg: "bg-sky-50", text: "text-sky-700" },
  } as const;

  const { label, bg, text } = map[name];

  return (
    <span
      className={`inline-flex items-center rounded-lg border border-black/10 px-3 py-1 text-xs font-semibold ${bg} ${text}`}
    >
      {label}
    </span>
  );
};
