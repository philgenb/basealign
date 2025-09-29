import { useMemo } from "react";

/** Detect whether the user is on macOS/iOS (for showing ⌘ vs Ctrl). */
export const useIsMac = (): boolean =>
  useMemo(() => /Mac|iPhone|iPad|iPod/.test(navigator.userAgent), []);
