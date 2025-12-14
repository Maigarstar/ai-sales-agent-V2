'use client'

import { useState } from 'react'

// FIX 1: Point to the FOLDER ('.../ui/Form') so we get both Form and FormItem
import { FormItem, Form } from '../../components/ui/Form'

// FIX 2: Correct relative paths for Input and Button
import Input from '../../components/ui/Input/Input'
import Button from '../../components/ui/Button/Button'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'

// Validation schema
const validationSchema = z.object({
    email: z.string().email().min(5),
})

type ForgotPasswordFormSchema = z.infer<typeof validationSchema>

export type OnForgotPasswordSubmitPayload = {
    values: ForgotPasswordFormSchema
    setSubmitting: (isSubmitting: boolean) => void
    setMessage: (message: string) => void
    setEmailSent: (complete: boolean) => void
}

export type OnForgotPasswordSubmit = (
    payload: OnForgotPasswordSubmitPayload,
) => void

interface ForgotPasswordFormProps extends CommonProps {
    onForgotPasswordSubmit?: OnForgotPasswordSubmit
    emailSent: boolean
    setEmailSent: (complete: boolean) => void
    setMessage: (message: string) => void
    children?: ReactNode
}

const ForgotPasswordForm = (props: ForgotPasswordFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)

    const {
        className,
        onForgotPasswordSubmit,
        setMessage,
        setEmailSent,
        emailSent,
        children,
    } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<ForgotPasswordFormSchema>({
        resolver: zodResolver(validationSchema),
    })

    const onForgotPassword = async (values: ForgotPasswordFormSchema) => {
        if (onForgotPasswordSubmit) {
            onForgotPasswordSubmit({
                values,
                setSubmitting,
                setMessage,
                setEmailSent,
            })
        }
    }

    return (
        <div className={className}>
            {!emailSent ? (
                <Form onSubmit={handleSubmit(onForgotPassword)}>
                    <FormItem
                        label="Email"
                        invalid={Boolean(errors.email)}
                        errorMessage={errors.email?.message}
                    >
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="email"
                                    placeholder="Email"
                                    autoComplete="off"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <Button
                        block
                        loading={isSubmitting}
                        variant="solid"
                        type="submit"
                    >
                        {isSubmitting ? 'Submiting...' : 'Submit'}
                    </Button>
                </Form>
            ) : (
                <>{children}</>
            )}
        </div>
    )
}

export default ForgotPasswordForm