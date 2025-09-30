import React from 'react';

type Props = {
    className?: string;
};

export const VKeyIcon: React.FC<Props> = ({className}) => {
    return (
        <svg className={className} width="76" height="45" viewBox="0 0 76 45" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.0791016" width="75.7895" height="45" rx="5.92105" fill="#525A71"/>
            <path
                d="M37.1592 28.842L32.6504 16.1594H34.7949L38.1875 26.469H38.3281L41.7207 16.1594H43.8652L39.3477 28.842H37.1592Z"
                fill="white"/>
        </svg>
    )
}