import { createContext, useCallback, useMemo, useRef, useState } from 'react'
import './Toast.css'

const ToastContext = createContext(null)

const DEFAULT_DURATION = 3200

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const showToast = useCallback((toast) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const nextToast = {
      id,
      type: toast.type ?? 'info',
      message: toast.message ?? '',
      duration: toast.duration ?? DEFAULT_DURATION,
    }

    setToasts((prev) => [...prev, nextToast])

    if (nextToast.duration > 0) {
      const timer = setTimeout(() => dismissToast(id), nextToast.duration)
      timersRef.current.set(id, timer)
    }

    return id
  }, [dismissToast])

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    [dismissToast, showToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="toastStack"
        role="region"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast--${toast.type}`}
            role={toast.type === 'error' ? 'alert' : 'status'}
          >
            <span className="toast__message">{toast.message}</span>
            <button
              className="toast__close"
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export { ToastContext, ToastProvider }
