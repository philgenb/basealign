import React from 'react';

type Props = {
    className?: string;
};

export const TickIcon: React.FC<Props> = ({className}) => {
    return (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M15 0C6.72875 0 0 6.72875 0 15C0 23.2712 6.72875 30 15 30C23.2712 30 30 23.2712 30 15C30 6.72875 23.2712 0 15 0ZM14.8863 19.2738C14.4025 19.7575 13.7662 19.9987 13.1275 19.9987C12.4887 19.9987 11.8463 19.755 11.3575 19.2675L7.88 15.8975L9.62125 14.1012L13.1125 17.485L20.3737 10.3587L22.1287 12.14L14.8863 19.2738Z"
                fill="#7BC86D"/>
        </svg>
    )
}