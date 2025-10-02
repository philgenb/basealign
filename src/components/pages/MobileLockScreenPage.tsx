import React from "react";
import {BaseAlignIconMobile} from "../../assets/imageComponents/BaseAlignIconMobile";
import {EditorLineMobile1} from "../../assets/imageComponents/EditorLineMobile1";
import {EditorLineMobile2} from "../../assets/imageComponents/EditorLineMobile2";
import {EditorLineMobile3} from "../../assets/imageComponents/EditorLineMobile3";
import BaselineMobileBG from "../../assets/BaselineMobileBG.png";

export const MobileBlocker: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-start mt-28 h-screen bg-no-repeat bg-cover bg-center bg-fixed"
         style={{ backgroundImage: `url(${BaselineMobileBG})` }}
    >
      {/* Logo */}
     <BaseAlignIconMobile/>

      <div className="h-20"/>

      {/* Placeholder Box */}
      <div className="bg-white backdrop-blur rounded-2xl shadow-card border border-card px-12 py-10 mb-10">
        <ol className="space-y-4 text-[#E8EBF3] font-semibold">
          <li className="flex items-center gap-2">
            <span>1.</span>
            <EditorLineMobile1/>
          </li>
          <li className="flex items-center gap-2">
            <span>2.</span>
            <EditorLineMobile2/>
          </li>
          <li className="flex items-center gap-2">
            <span>3.</span>
            <EditorLineMobile3/>
          </li>
        </ol>
      </div>

      <p className="text-[#202122] font-bold font-jakarta text-lg mt-2">Please use us on desktop.</p>
    </div>
  );
};
