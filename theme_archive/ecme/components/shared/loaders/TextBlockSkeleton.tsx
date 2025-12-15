'use client'

import Skeleton from '@/components/ui/Skeleton'
import type { SkeletonProps } from '@/components/ui/Skeleton'

interface TextBlockSkeletonProps extends SkeletonProps {
    rowCount?: number
    lastChildWidth?: string | number
    height?: string | number
    titleWidth?: string | number
    title?: boolean
}

const TextBlockSkeleton = (props: TextBlockSkeletonProps) => {
    const {
        height,
        lastChildWidth = '60%',
        rowCount = 3,
        title = true,
        titleWidth = '40%',
        ...rest
    } = props

    return (
        <div className="flex flex-col gap-4">
            {title && (
                <div className="mb-1">
                    <Skeleton height={height} width={titleWidth} {...rest} />
                </div>
            )}
            {Array.from(new Array(rowCount), (_, i) => i + 1).map(
                (row, index) => (
                    <Skeleton
                        key={row}
                        height={height}
                        width={index === rowCount - 1 ? lastChildWidth : undefined}
                        {...rest}
                    />
                ),
            )}
        </div>
    )
}

export default TextBlockSkeleton
