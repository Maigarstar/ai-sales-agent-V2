import * as React from 'react'

export type FileNotFoundProps = React.SVGProps<SVGSVGElement>

const FileNotFound = (props: FileNotFoundProps) => {
    const { width = 120, height = 120, ...rest } = props

    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 128 128"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            {...rest}
        >
            <path
                d="M36 18h36l20 20v72a8 8 0 0 1-8 8H36a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8z"
                fill="currentColor"
                opacity="0.12"
            />
            <path
                d="M72 18v16a8 8 0 0 0 8 8h16"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinejoin="round"
                opacity="0.35"
            />
            <path
                d="M36 18h36l20 20v72a8 8 0 0 1-8 8H36a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8z"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinejoin="round"
                opacity="0.55"
            />
            <path
                d="M44 62h40M44 74h34"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.45"
            />
            <path
                d="M88 96l10 10"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.6"
            />
            <circle
                cx="76"
                cy="84"
                r="14"
                stroke="currentColor"
                strokeWidth="6"
                opacity="0.6"
            />
        </svg>
    )
}

export default FileNotFound
