import { motion } from "motion/react";
import { useIsMac } from "../../hooks/useIsMac";
import {EditorLine2} from "../../assets/imageComponents/EditorLine2";
import {EditorLine1} from "../../assets/imageComponents/EditorLine1";
import {EditorLine3} from "../../assets/imageComponents/EditorLine3";
import {EditorLine4} from "../../assets/imageComponents/EditorLine4";

/** Small keycap visual */
const Keycap: React.FC<React.PropsWithChildren> = ({ children }) => (
  <span className="inline-flex items-center justify-center rounded-md border px-3 py-1 text-sm font-semibold shadow-sm bg-white text-[#3B4252] border-black/10">
    {children}
  </span>
);

export const PlaceholderEditor: React.FC = () => {
  const isMac = useIsMac();

  return (
    <div className="px-7 pb-6">
      <div className="mt-2 w-full rounded-xl bg-white px-6 py-5">
        <div className="space-y-3">
          {/* Line 1 */}
          <div className="flex items-center gap-3">
            <div className="w-6 text-right font-mono text-base text-[#E8EBF3] select-none">
              1.
            </div>
            <div className="text-sm font-jetbrains text-[#707083]">
              <span>Paste your code here</span>
              <motion.span
                aria-hidden
                initial={{ opacity: 1 }}
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
              >
                _
              </motion.span>
            </div>
          </div>

          {/* Line 2 */}
          <div className="flex items-center gap-3">
            <div className="w-6 text-right font-mono text-base text-[#E8EBF3] select-none">
              2.
            </div>
            <EditorLine1 />
          </div>

          {/* Line 3 */}
          <div className="flex items-center gap-3">
            <div className="w-6 text-right font-mono text-base text-[#E8EBF3] select-none">
              3.
            </div>
            <EditorLine2 />
          </div>

          {/* Line 4 */}
          <div className="flex items-center gap-3">
            <div className="w-6 text-right font-mono text-base text-[#E8EBF3] select-none">
              4.
            </div>
            <EditorLine3 />
          </div>

          {/* Line 5 */}
          <div className="flex items-center gap-3">
            <div className="w-6 text-right font-mono text-base text-[#E8EBF3] select-none">
              5.
            </div>
            <EditorLine4 />
          </div>
        </div>
      </div>
    </div>
  );
};
