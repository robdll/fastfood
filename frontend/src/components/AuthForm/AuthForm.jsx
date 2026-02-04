import { useState } from 'react'
import Spinner from '../Spinner/Spinner'
import useLogin from '../../hooks/useLogin'
import useSignup from '../../hooks/useSignup'
import useToast from '../../hooks/useToast'
import './AuthForm.css'

function AuthForm({ onSubmit, t }) {
  const [mode, setMode] = useState('signin')
  const [roles, setRoles] = useState({
    client: true,
    restaurant: false,
  })
  const {
    signup,
    isSubmitting: isSignupSubmitting,
    submitError: signupError,
  } = useSignup()
  const {
    login,
    isSubmitting: isLoginSubmitting,
    submitError: loginError,
  } = useLogin()
  const { showToast } = useToast()

  const hasAnyRole = roles.client || roles.restaurant

  const getFormValues = (formData, fields) => {
    return fields.reduce((acc, field) => {
      const raw = (formData.get(field) || '').toString()
      acc[field] = raw.trim()
      return acc
    }, {})
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (mode === 'signup') {
      if (!hasAnyRole || isSignupSubmitting) return

      const formData = new FormData(event.currentTarget)
      const baseFields = getFormValues(formData, [
        'firstName',
        'lastName',
        'email',
      ])
      const { password } = getFormValues(formData, ['password'])

      const payload = {
        ...baseFields,
        password,
        roles: Object.entries(roles)
          .filter(([, enabled]) => enabled)
          .map(([role]) => role),
      }

      if (roles.client) {
        const { paymentMethod } = getFormValues(formData, ['paymentMethod'])
        payload.clientData = {
          paymentMethod,
          preferences: formData
            .getAll('preferences')
            .map((value) => value.toString().trim()),
        }
      }

      if (roles.restaurant) {
        const restaurantValues = getFormValues(formData, [
          'restaurantName',
          'restaurantPhone',
          'vat',
          'restaurantAddress',
        ])
        payload.restaurantData = {
          name: restaurantValues.restaurantName,
          phone: restaurantValues.restaurantPhone,
          vat: restaurantValues.vat,
          address: restaurantValues.restaurantAddress,
        }
      }

      const wasSuccessful = await signup(payload, t('auth.signupError'))
      if (wasSuccessful) {
        showToast({ type: 'success', message: t('auth.signupToast') })
        setMode('signin')
      }
      return
    }

    if (isLoginSubmitting) return
    const formData = new FormData(event.currentTarget)
    const { email, password } = getFormValues(formData, ['email', 'password'])
    const response = await login({ email, password }, t('auth.signinError'))
    if (response?.token) {
      onSubmit(response)
    }
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
                  <select className="input" name="paymentMethod" required>
                    <option value="">{t('auth.paymentSelectPlaceholder')}</option>
                    <option value="delivery">{t('auth.paymentDelivery')}</option>
                    <option value="cards">{t('auth.paymentCards')}</option>
                    <option value="coupons">{t('auth.paymentCoupons')}</option>
                  </select>
                </label>
                <div className="formField">
                  <span className="preferenceTitle">
                    {t('auth.preferences')}
                  </span>
                  <div className="preferenceList">
                    <label className="checkboxRow">
                      <input
                        type="checkbox"
                        name="preferences"
                        value="promo"
                      />
                      <span>{t('auth.preferencePromo')}</span>
                      <span
                        className="infoIcon"
                        data-tooltip={t('auth.preferencePromoHint')}
                        aria-label={t('auth.preferencePromoHint')}
                      >
                        i
                      </span>
                    </label>
                    <label className="checkboxRow">
                      <input
                        type="checkbox"
                        name="preferences"
                        value="cheapest"
                      />
                      <span>{t('auth.preferenceCheapest')}</span>
                      <span
                        className="infoIcon"
                        data-tooltip={t('auth.preferenceCheapestHint')}
                        aria-label={t('auth.preferenceCheapestHint')}
                      >
                        i
                      </span>
                    </label>
                    <label className="checkboxRow">
                      <input
                        type="checkbox"
                        name="preferences"
                        value="popular"
                      />
                      <span>{t('auth.preferencePopular')}</span>
                      <span
                        className="infoIcon"
                        data-tooltip={t('auth.preferencePopularHint')}
                        aria-label={t('auth.preferencePopularHint')}
                      >
                        i
                      </span>
                    </label>
                  </div>
                </div>
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
          {(mode === 'signup' ? signupError : loginError) && (
            <span className="tiny errorText" role="status">
              {mode === 'signup' ? signupError : loginError}
            </span>
          )}
          <button
            className="btn btn--primary"
            type="submit"
            disabled={
              isSignupSubmitting ||
              isLoginSubmitting ||
              (mode === 'signup' && !hasAnyRole)
            }
          >
            {isSignupSubmitting || isLoginSubmitting ? (
              <Spinner
                className="spinner--button"
                label={t('common.loading')}
              />
            ) : mode === 'signup' ? (
              t('auth.submitCreate')
            ) : (
              t('auth.submitSignIn')
            )}
          </button>
        </div>
      </form>
    </section>
  )
}

export default AuthForm
