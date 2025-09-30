import React from "react";
import {ChromeIcon} from "../../assets/imageComponents/ChromeIcon";
import {FirefoxIcon} from "../../assets/imageComponents/FirefoxIcon";
import {SafariIcon} from "../../assets/imageComponents/SafariIcon";

type BrowserName = "chrome" | "firefox" | "safari";

export const BrowserBadge: React.FC<{ name: BrowserName }> = ({name}) => {
    const icons: Record<BrowserName, React.ReactNode> = {
        chrome: <ChromeIcon className="h-8 w-8"/>,
        firefox: <FirefoxIcon className="h-8 w-8"/>,
        safari: <SafariIcon className="h-8 w-8"/>,
    };

    return (
        <div
            className="
        flex items-center justify-center rounded-2xl p-2
        bg-white
        shadow-card
        border border-card
      "
        >
            {icons[name]}
        </div>
    );
};
