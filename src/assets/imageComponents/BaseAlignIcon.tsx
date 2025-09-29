import React from 'react';

type Props = {
    className?: string;
};

export const BaseAlignIcon: React.FC<Props> = ({className}) => {
    return (
        <svg width="94" height="94" viewBox="0 0 94 94" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_d_16_2)">
                <rect x="14" y="14" width="66" height="66" rx="13.2" fill="white"/>
                <rect x="14.528" y="14.528" width="64.944" height="64.944" rx="12.672" stroke="#E5E7EB"
                      stroke-width="1.056"/>
            </g>
            <mask id="mask0_16_2" maskUnits="userSpaceOnUse" x="30" y="48" width="34"
                  height="20">
                <rect x="30.715" y="48.7633" width="32.6753" height="18.0574" fill="#D9D9D9" stroke="#E7D35B"
                      stroke-width="0.429938"/>
            </mask>
            <g mask="url(#mask0_16_2)">
                <path
                    d="M35.0142 20.3875V57.5489C35.0142 58.3956 35.7005 59.0819 36.5471 59.0819H41.5697C50.8901 59.0819 58.4458 51.5262 58.4458 42.2058C58.4458 41.5534 57.9169 41.0245 57.2644 41.0245H43.6129"
                    stroke="#EDD64D" stroke-width="6.87901"/>
            </g>
            <mask id="mask1_16_2" maskUnits="userSpaceOnUse" x="30" y="28" width="10"
                  height="21">
                <rect x="30.715" y="28.3578" width="9.0287" height="19.9756" fill="#7B96E8" stroke="#7B96E8"
                      stroke-width="0.429938"/>
            </mask>
            <g mask="url(#mask1_16_2)">
                <path
                    d="M35.0142 29.1777V54.2607C35.0142 55.1073 35.7005 55.7936 36.5471 55.7936H46.8376C53.2486 55.7936 58.4458 50.5965 58.4458 44.1854C58.4458 43.7367 58.082 43.3729 57.6332 43.3729H43.6129"
                    stroke="#7B96E8" stroke-width="6.87901"/>
            </g>
            <mask id="mask2_16_2" maskUnits="userSpaceOnUse" x="42" y="34" width="22"
                  height="15">
                <rect x="42.3234" y="35.005" width="21.067" height="13.3281" fill="#D9D9D9" stroke="#525A71"
                      stroke-width="0.429938"/>
            </mask>
            <g mask="url(#mask2_16_2)">
                <path
                    d="M34.7988 20.3875V57.5489C34.7988 58.3956 35.4851 59.0819 36.3317 59.0819H41.3544C50.6748 59.0819 58.2304 51.5262 58.2304 42.2058C58.2304 41.5534 57.7015 41.0245 57.0491 41.0245H43.3976"
                    stroke="#525A71" stroke-width="6.87901"/>
            </g>
            <defs>
                <filter id="filter0_d_16_2" x="0.8" y="0.8" width="92.4" height="92.4" filterUnits="userSpaceOnUse"
                        color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                   result="hardAlpha"/>
                    <feOffset/>
                    <feGaussianBlur stdDeviation="6.6"/>
                    <feComposite in2="hardAlpha" operator="out"/>
                    <feColorMatrix type="matrix"
                                   values="0 0 0 0 0.482353 0 0 0 0 0.588235 0 0 0 0 0.909804 0 0 0 0.13 0"/>
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_16_2"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_16_2" result="shape"/>
                </filter>
            </defs>
        </svg>

    )
}