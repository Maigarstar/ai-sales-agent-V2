import type { CSSProperties, ReactNode } from 'react'

export interface CommonProps {
    className?: string
    children?: ReactNode
    style?: CSSProperties
}

export namespace TypeAttributes {
    export type Status = 'success' | 'danger' | 'info' | 'warning'
    export type ControlSize = 'xs' | 'sm' | 'md' | 'lg'
}
