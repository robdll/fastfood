import { useCallback, useState } from 'react'
import { createUser } from '../services/users'

const useSignup = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const signup = useCallback(async (payload, fallbackMessage) => {
    setIsSubmitting(true)
    setSubmitError('')

    try {
      await createUser(payload, fallbackMessage)
      return true
    } catch (error) {
      setSubmitError(error.message || fallbackMessage || '')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { signup, isSubmitting, submitError }
}

export default useSignup
