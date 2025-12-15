'use client'

import { useEffect, useRef, useState } from 'react'

export default function useTimeOutMessage(
  defaultMessage = '',
  timeout = 3000
): [string, (msg: string) => void] {
  const [message, setMessageState] = useState(defaultMessage)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setMessage = (msg: string) => {
    setMessageState(msg)

    if (timerRef.current) clearTimeout(timerRef.current)

    if (msg) {
      timerRef.current = setTimeout(() => {
        setMessageState('')
        timerRef.current = null
      }, timeout)
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return [message, setMessage]
}
