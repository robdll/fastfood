import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AuthPage from '../views/AuthPage'
import Dashboard from '../views/Dashboard'
import Landing from '../views/Landing'

function RequireAuth({ isAuthed, children }) {
  if (!isAuthed) return <Navigate to="/auth" replace />
  return children
}

function AppRoutes({
  health,
  error,
  isAuthed,
  lang,
  onLangChange,
  onLogin,
  onLogout,
  t,
}) {
  const navigate = useNavigate()

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Landing
            health={health}
            error={error}
            onEnterApp={() => {
              navigate(isAuthed ? '/dashboard' : '/auth')
            }}
            lang={lang}
            onLangChange={onLangChange}
            t={t}
          />
        }
      />
      <Route
        path="/auth"
        element={
          isAuthed ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthPage
              onAuthSuccess={(authResponse) => {
                onLogin(authResponse)
                navigate('/dashboard', { replace: true })
              }}
              lang={lang}
              onLangChange={onLangChange}
              t={t}
            />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth isAuthed={isAuthed}>
            <Dashboard
              onLogout={() => {
                onLogout()
                navigate('/', { replace: true })
              }}
              lang={lang}
              onLangChange={onLangChange}
              t={t}
            />
          </RequireAuth>
        }
      />
      <Route
        path="/app"
        element={
          <Navigate to={isAuthed ? '/dashboard' : '/auth'} replace />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
