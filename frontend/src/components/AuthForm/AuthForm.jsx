import { useState } from 'react'
import './AuthForm.css'

function AuthForm({ onSubmit, t }) {
  const [mode, setMode] = useState('signin')
  const [roles, setRoles] = useState({
    client: true,
    restaurant: false,
  })

  const hasAnyRole = roles.client || roles.restaurant

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <section className="card authCard" aria-labelledby="auth-title">
      <div className="authHeader">
        <div>
          <h2 id="auth-title">{t('auth.title')}</h2>
          <p className="muted">{t('auth.subtitle')}</p>
        </div>
        <div
          className="segmented"
          role="tablist"
          aria-label={t('auth.modeLabel')}
        >
          <button
            type="button"
            className={`segmented__btn ${mode === 'signin' ? 'is-active' : ''}`}
            onClick={() => setMode('signin')}
          >
            {t('auth.signIn')}
          </button>
          <button
            type="button"
            className={`segmented__btn ${mode === 'signup' ? 'is-active' : ''}`}
            onClick={() => setMode('signup')}
          >
            {t('auth.signUp')}
          </button>
        </div>
      </div>

      <form className="authForm" onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <div className="formGrid">
            <label className="formField">
              <span>{t('auth.firstName')}</span>
              <input className="input" name="firstName" required />
            </label>
            <label className="formField">
              <span>{t('auth.lastName')}</span>
              <input className="input" name="lastName" required />
            </label>
          </div>
        )}

        <div className="formGrid">
          <label className="formField">
            <span>{t('auth.email')}</span>
            <input className="input" type="email" name="email" required />
          </label>
          <label className="formField">
            <span>{t('auth.password')}</span>
            <input
              className="input"
              type="password"
              name="password"
              required
            />
          </label>
        </div>

        {mode === 'signup' && (
          <>
            <fieldset className="formField formField--checkboxes">
              <legend>{t('auth.roleLegend')}</legend>
              <label className="checkboxRow">
                <input
                  type="checkbox"
                  checked={roles.client}
                  onChange={(event) =>
                    setRoles((prev) => ({
                      ...prev,
                      client: event.target.checked,
                    }))
                  }
                />
                <span>{t('auth.roleClient')}</span>
              </label>
              <label className="checkboxRow">
                <input
                  type="checkbox"
                  checked={roles.restaurant}
                  onChange={(event) =>
                    setRoles((prev) => ({
                      ...prev,
                      restaurant: event.target.checked,
                    }))
                  }
                />
                <span>{t('auth.roleRestaurant')}</span>
              </label>
              {!hasAnyRole && (
                <p className="helperText">{t('auth.roleHint')}</p>
              )}
            </fieldset>

            {roles.client && (
              <div className="card subtleCard">
                <h3 className="miniTitle">{t('auth.clientData')}</h3>
                <label className="formField">
                  <span>{t('auth.paymentMethod')}</span>
                  <input
                    className="input"
                    name="payment"
                    placeholder={t('auth.paymentPlaceholder')}
                  />
                </label>
                <label className="formField">
                  <span>{t('auth.preferences')}</span>
                  <textarea
                    className="textarea"
                    name="preferences"
                    rows={3}
                    placeholder={t('auth.preferencesPlaceholder')}
                  />
                </label>
              </div>
            )}

            {roles.restaurant && (
              <div className="card subtleCard">
                <h3 className="miniTitle">{t('auth.restaurateurData')}</h3>
                <div className="formGrid">
                  <label className="formField">
                    <span>{t('auth.restaurantName')}</span>
                    <input className="input" name="restaurantName" />
                  </label>
                  <label className="formField">
                    <span>{t('auth.restaurantPhone')}</span>
                    <input className="input" name="restaurantPhone" />
                  </label>
                </div>
                <div className="formGrid">
                  <label className="formField">
                    <span>{t('auth.vat')}</span>
                    <input className="input" name="vat" />
                  </label>
                  <label className="formField">
                    <span>{t('auth.restaurantAddress')}</span>
                    <input className="input" name="restaurantAddress" />
                  </label>
                </div>
              </div>
            )}
          </>
        )}

        <div className="authFooter">
          <button
            className="btn btn--primary"
            type="submit"
            disabled={mode === 'signup' && !hasAnyRole}
          >
            {mode === 'signup'
              ? t('auth.submitCreate')
              : t('auth.submitSignIn')}
          </button>
          <span className="tiny muted">
            {mode === 'signup' ? t('auth.signupNote') : t('auth.signinNote')}
          </span>
        </div>
      </form>
    </section>
  )
}

export default AuthForm
