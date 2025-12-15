import type { ReactNode, CSSProperties } from 'react'

export interface CommonProps {
    id?: string
    className?: string
    children?: ReactNode
    style?: CSSProperties
}

export type WithProps = CommonProps

export declare namespace TypeAttributes {
    export type Size = 'lg' | 'md' | 'sm' | 'xs'
    export type Shape = 'round' | 'circle' | 'none'
    export type Status = 'success' | 'warning' | 'danger' | 'info'
    export type FormLayout = 'horizontal' | 'vertical' | 'inline'
    export type ControlSize = 'lg' | 'md' | 'sm'
    export type Direction = 'ltr' | 'rtl'
}

export type StepStatus = 'complete' | 'pending' | 'in-progress' | 'error'
