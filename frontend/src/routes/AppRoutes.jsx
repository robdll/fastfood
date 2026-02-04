import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AuthPage from '../views/AuthPage'
import Dashboard from '../views/Dashboard'
import Landing from '../views/Landing'
import Settings from '../views/Settings'

function RequireAuth({ isAuthed, children }) {
  if (!isAuthed) return <Navigate to="/auth" replace />
  return children
}

function AppRoutes({
  health,
  error,
  isAuthed,
  user,
  fallbackRoles = [],
  lang,
  onLangChange,
  onLogin,
  onLogout,
  onUserUpdate,
  t,
}) {
  const navigate = useNavigate()
  const userRoles = user?.roles ?? fallbackRoles
  const canSwitchDashboards =
    userRoles.includes('client') && userRoles.includes('restaurant')

  const resolveDashboardPath = (roles = userRoles) => {
    if (roles.includes('client')) return '/dashboard/client'
    if (roles.includes('restaurant')) return '/dashboard/restaurant'
    return '/dashboard/client'
  }

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
            <Navigate to={resolveDashboardPath()} replace />
          ) : (
            <AuthPage
              onAuthSuccess={(authResponse) => {
                onLogin(authResponse)
                navigate(resolveDashboardPath(authResponse?.user?.roles ?? []), {
                  replace: true,
                })
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
            <Navigate to={resolveDashboardPath()} replace />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/client"
        element={
          <RequireAuth isAuthed={isAuthed}>
            <Dashboard
              variant="client"
              canSwitch={canSwitchDashboards}
              switchPath="/dashboard/restaurant"
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
        path="/dashboard/restaurant"
        element={
          <RequireAuth isAuthed={isAuthed}>
            <Dashboard
              variant="restaurant"
              canSwitch={canSwitchDashboards}
              switchPath="/dashboard/client"
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
        path="/settings"
        element={
          <RequireAuth isAuthed={isAuthed}>
            <Settings
              user={user}
              onUserUpdate={onUserUpdate}
              onLogout={() => {
                onLogout()
                navigate('/', { replace: true })
              }}
              backTo={resolveDashboardPath()}
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
          <Navigate
            to={isAuthed ? resolveDashboardPath() : '/auth'}
            replace
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
