import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { EditorLine2 } from "../../assets/imageComponents/EditorLine2";
import { EditorLine1 } from "../../assets/imageComponents/EditorLine1";
import { EditorLine3 } from "../../assets/imageComponents/EditorLine3";
import { EditorLine4 } from "../../assets/imageComponents/EditorLine4";

/** Small keycap visual */
const Keycap: React.FC<React.PropsWithChildren> = ({ children }) => (
  <span className="inline-flex items-center justify-center rounded-md border px-3 py-1 text-sm font-semibold shadow-sm bg-white text-[#3B4252] border-black/10">
    {children}
  </span>
);

export const PlaceholderEditor: React.FC = () => {
  const fullText = "Paste your code here";
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loop, setLoop] = useState(0);

  useEffect(() => {
    const speed = isDeleting ? 70 : 120; // typing vs deleting speed
    let delay = speed;

    if (!isDeleting && displayed === fullText) {
      // finished typing → wait 5 seconds before deleting
      delay = 5000;
    }

    const timeout = setTimeout(() => {
      setDisplayed((prev) => {
        if (!isDeleting) {
          // typing
          const next = fullText.slice(0, prev.length + 1);
          if (next === fullText) {
            // don't immediately set deleting here,
            // the 5s delay will kick in before deletion starts
            return next;
          }
          return next;
        } else {
          // deleting
          const next = prev.slice(0, -1);
          if (next === "") {
            setIsDeleting(false);
            setLoop(loop + 1);
          }
          return next;
        }
      });

      // trigger deleting after the pause
      if (!isDeleting && displayed === fullText) {
        setIsDeleting(true);
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, loop]);

  return (
    <div className="px-7 pb-6">
      <div className="mt-2 w-full rounded-xl bg-white px-6 py-5">
        <div className="space-y-3">
          {/* Line 1 */}
          <div className="flex items-center gap-3">
            <div className="w-6 text-right font-mono text-base text-[#E8EBF3] select-none">
              1.
            </div>
            <div className="text-sm font-bold font-jetbrains text-[#707083]">
              <span>{displayed}</span>
              {/* blinking cursor */}
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
