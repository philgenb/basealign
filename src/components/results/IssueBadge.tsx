import React from "react";

type IssueBadgeProps = {
  count: number;
  label: string;
  variant: "error" | "warning";
};

export const IssueBadge: React.FC<IssueBadgeProps> = ({ count, label, variant }) => {
  const styles = {
    error: {
      bg: "bg-error-bg",
      text: "text-error",
    },
    warning: {
      bg: "bg-warning-bg",
      text: "text-warning",
    },
  }[variant];

  return (
    <div className="flex items-center gap-2 font-jakarta">
      <span
        className={`px-4 py-0.5 rounded-full font-extrabold ${styles.bg} ${styles.text}`}
      >
        {count}
      </span>
      <span className="text-[#45484A] text-sm font-semibold">{label}</span>
    </div>
  );
};
