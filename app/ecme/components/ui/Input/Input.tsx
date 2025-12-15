'use client'

import { useState, useEffect, useRef } from 'react'
import classNames from 'classnames'
import { useConfig } from '../ConfigProvider'
import { useForm, useFormItem } from '../Form/context'
import { useInputGroup } from '../InputGroup/context'
import { CONTROL_SIZES } from '../../../utils/constants'
import type { CommonProps, TypeAttributes } from '../../../@types/common'
import type {
    InputHTMLAttributes,
    ElementType,
    ReactNode,
    HTMLInputTypeAttribute,
    ClassAttributes,
    Ref,
} from 'react'

const isNil = (val: unknown): val is null | undefined =>
    val === null || typeof val === 'undefined'

export interface InputProps
    extends CommonProps,
        Omit<
            InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>,
            'size' | 'prefix'
        > {
    asElement?: ElementType
    disabled?: boolean
    invalid?: boolean
    prefix?: string | ReactNode
    rows?: number
    ref?: Ref<ElementType | HTMLInputElement | HTMLTextAreaElement>
    size?: TypeAttributes.ControlSize
    suffix?: string | ReactNode
    textArea?: boolean
    type?: HTMLInputTypeAttribute
    unstyle?: boolean
}

const Input = (props: InputProps) => {
    const {
        asElement: Component = 'input',
        className,
        disabled,
        invalid,
        prefix,
        size,
        suffix,
        textArea,
        type = 'text',
        ref,
        rows,
        style,
        unstyle = false,
        ...rest
    } = props

    const [prefixGutter, setPrefixGutter] = useState(0)
    const [suffixGutter, setSuffixGutter] = useState(0)

    const { controlSize, direction } = useConfig()
    const formControlSize = useForm()?.size
    const formItemInvalid = useFormItem()?.invalid
    const inputGroupSize = useInputGroup()?.size

    const inputSize = size || inputGroupSize || formControlSize || controlSize
    const isInputInvalid = invalid || formItemInvalid

    const fixControlledValue = (
        val: string | number | readonly string[] | undefined,
    ) => {
        if (typeof val === 'undefined' || val === null) {
            return ''
        }
        return val
    }

    if ('value' in props) {
        ;(rest as any).value = fixControlledValue((props as any).value)
        delete (rest as any).defaultValue
    }

    const inputDefaultClass = 'input'
    const inputSizeClass = `input-${inputSize} ${CONTROL_SIZES[inputSize].h}`
    const inputFocusClass =
        'focus:ring-primary focus-within:ring-primary focus-within:border-primary focus:border-primary'

    const inputWrapperClass = classNames(
        'input-wrapper',
        prefix || suffix ? className : '',
    )

    const inputClass = classNames(
        inputDefaultClass,
        inputSizeClass,
        !isInputInvalid && inputFocusClass,
        !prefix && !suffix ? className : '',
        disabled && 'input-disabled',
        isInputInvalid && 'input-invalid',
        textArea && 'input-textarea',
    )

    const prefixNode = useRef<HTMLDivElement>(null)
    const suffixNode = useRef<HTMLDivElement>(null)

    const getAffixSize = () => {
        if (!prefixNode.current && !suffixNode.current) return

        const prefixNodeWidth = prefixNode.current?.offsetWidth
        const suffixNodeWidth = suffixNode.current?.offsetWidth

        if (isNil(prefixNodeWidth) && isNil(suffixNodeWidth)) return

        if (prefixNodeWidth) setPrefixGutter(prefixNodeWidth)
        if (suffixNodeWidth) setSuffixGutter(suffixNodeWidth)
    }

    useEffect(() => {
        getAffixSize()
    }, [prefix, suffix])

    const remToPxConvertion = (pixel: number) => 0.0625 * pixel

    const affixGutterStyle = () => {
        const leftGutter = `${remToPxConvertion(prefixGutter) + 1}rem`
        const rightGutter = `${remToPxConvertion(suffixGutter) + 1}rem`

        const gutterStyle: {
            paddingLeft?: string
            paddingRight?: string
        } = {}

        if (direction === 'ltr') {
            if (prefix) gutterStyle.paddingLeft = leftGutter
            if (suffix) gutterStyle.paddingRight = rightGutter
        }

        if (direction === 'rtl') {
            if (prefix) gutterStyle.paddingRight = leftGutter
            if (suffix) gutterStyle.paddingLeft = rightGutter
        }

        return gutterStyle
    }

    const inputProps = {
        className: !unstyle ? inputClass : '',
        disabled,
        type,
        ref,
        ...rest,
    }

    const renderTextArea = (
        <textarea
            style={style}
            rows={rows}
            {...(inputProps as ClassAttributes<HTMLTextAreaElement>)}
        />
    )

    const renderInput = (
        <Component
            style={{ ...affixGutterStyle(), ...style }}
            {...(inputProps as any)}
        />
    )

    const renderAffixInput = (
        <span className={inputWrapperClass}>
            {prefix ? (
                <div ref={prefixNode} className="input-suffix-start">
                    {prefix}
                </div>
            ) : null}

            {renderInput}

            {suffix ? (
                <div ref={suffixNode} className="input-suffix-end">
                    {suffix}
                </div>
            ) : null}
        </span>
    )

    if (textArea) return renderTextArea
    if (prefix || suffix) return renderAffixInput
    return renderInput
}

export default Input
