'use client'

import { useState } from 'react'

// FIX: Update these 3 imports to use the relative path matching your project structure
import Input from '../../components/ui/Input/Input'
import Button from '../../components/ui/Button/Button'
import { FormItem, Form } from '../../components/ui/Form/Form'

import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { CommonProps } from '@/@types/common'

// Define the form schema
const validationSchema = z.object({
    email: z.string().email().min(1, { message: 'Please enter your email' }),
})

export type OnForgotPasswordSubmit = (
    values: z.infer<typeof validationSchema>,
    setSubmitting: (isSubmitting: boolean) => void
) => void

export interface ForgotPasswordFormProps extends CommonProps {
    emailSent: boolean
    setMessage: (message: string) => void
    setEmailSent: (complete: boolean) => void
    onForgotPasswordSubmit?: OnForgotPasswordSubmit
}

const ForgotPasswordForm = (props: ForgotPasswordFormProps) => {
    const {
        emailSent,
        setMessage,
        setEmailSent,
        onForgotPasswordSubmit,
        children,
        className,
    } = props

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof validationSchema>>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            email: '',
        },
    })

    const onFormSubmit = (values: z.infer<typeof validationSchema>) => {
        const { email } = values
        if (emailSent) {
            setEmailSent(false)
            return
        }
        onForgotPasswordSubmit?.(values, (isSubmitting) => {
            if (!isSubmitting) {
                setEmailSent(true)
            }
        })
    }

    return (
        <div className={className}>
            <Form
                layout="vertical"
                onFinish={handleSubmit(onFormSubmit)}
            >
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
                                {...field}
                                type="email"
                                placeholder="Email"
                                autoComplete="off"
                            />
                        )}
                    />
                </FormItem>
                <FormItem>
                    {children}
                </FormItem>
            </Form>
        </div>
    )
}

export default ForgotPasswordForm