import { useCallback, useState } from 'react'
import { loginUser } from '../services/auth'

const useLogin = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const login = useCallback(async (payload, fallbackMessage) => {
    setIsSubmitting(true)
    setSubmitError('')

    try {
      const response = await loginUser(payload, fallbackMessage)
      return response
    } catch (error) {
      setSubmitError(error.message || fallbackMessage || '')
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { login, isSubmitting, submitError }
}

export default useLogin
