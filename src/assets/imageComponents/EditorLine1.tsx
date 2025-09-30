import React from 'react';

type Props = {
    className?: string;
};

export const EditorLine1: React.FC<Props> = ({className}) => {
    return (
        <svg width="275" height="23" viewBox="0 0 275 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="275" height="23" rx="11.5" fill="#F5F6F9"/>
        </svg>
    )
}