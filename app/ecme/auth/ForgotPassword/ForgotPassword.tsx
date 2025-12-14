'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// FIX 1: Adjust paths for UI components (Go up 2 levels to 'components', then into 'ui')
import Alert from '../../ui/Alert/Alert'
import Button from '../../ui/Button/Button'
import ActionLink from '../../shared/ActionLink'

// FIX 2: Adjust path for Utils (Go up 3 levels to 'ecme', then into 'utils')
import useTimeOutMessage from '../../../utils/hooks/useTimeOutMessage'

// Import the form component (Same folder, so ./ is correct)
import ForgotPasswordFormOriginal from './ForgotPasswordForm'
import type { OnForgotPasswordSubmit } from './ForgotPasswordForm'

// FIX 3: "as any" trick to prevent the children type error
const ForgotPasswordForm = ForgotPasswordFormOriginal as any

type ForgotPasswordProps = {
  signInUrl?: string
  onForgotPasswordSubmit?: OnForgotPasswordSubmit
}

export const ForgotPassword = ({
  signInUrl = '/sign-in',
  onForgotPasswordSubmit,
}: ForgotPasswordProps) => {
  const [emailSent, setEmailSent] = useState(false)
  const [message, setMessage] = useTimeOutMessage()
  const router = useRouter()

  const handleContinue = () => {
    router.push(signInUrl)
  }

  return (
    <div>
      <div className="mb-6">
        {emailSent ? (
          <>
            <h3 className="mb-2">Check your email</h3>
            <p className="font-semibold heading-text">
              We have sent a password recovery to your email
            </p>
          </>
        ) : (
          <>
            <h3 className="mb-2">Forgot Password</h3>
            <p className="font-semibold heading-text">
              Please enter your email to receive a verification code
            </p>
          </>
        )}
      </div>

      {message && (
        <Alert showIcon className="mb-4" type="danger">
          <span className="break-all">{message}</span>
        </Alert>
      )}

      <ForgotPasswordForm
        emailSent={emailSent}
        setMessage={setMessage}
        setEmailSent={setEmailSent}
        onForgotPasswordSubmit={onForgotPasswordSubmit}
      >
        <Button block variant="solid" type="button" onClick={handleContinue}>
          Continue
        </Button>
      </ForgotPasswordForm>

      <div className="mt-4 text-center">
        <span>Back to </span>
        <ActionLink
          href={signInUrl}
          className="heading-text font-bold"
          themeColor={false}
        >
          Sign in
        </ActionLink>
      </div>
    </div>
  )
}

export default ForgotPassword