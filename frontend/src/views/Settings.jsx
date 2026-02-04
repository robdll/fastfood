import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar/Navbar'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import Modal from '../components/Modal/Modal'
import Spinner from '../components/Spinner/Spinner'
import AddressPicker from '../components/AddressPicker/AddressPicker'
import useToast from '../hooks/useToast'
import { updateUser } from '../services/users'
import { getJwt } from '../utils/auth'

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  paymentMethod: '',
  preferences: {
    promo: false,
    cheapest: false,
    popular: false,
  },
  restaurantName: '',
  restaurantPhone: '',
  vat: '',
  restaurantAddress: '',
}

function Settings({
  user,
  onUserUpdate,
  onLogout,
  backTo,
  lang,
  onLangChange,
  t,
}) {
  const { showToast } = useToast()
  const [form, setForm] = useState(emptyForm)
  const [roles, setRoles] = useState({ client: false, restaurant: false })
  const [lockedRoles, setLockedRoles] = useState({
    client: false,
    restaurant: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const userRoles = user?.roles ?? []
  const canSwitch = userRoles.includes('client') && userRoles.includes('restaurant')
  const isRestaurantDashboard = backTo?.includes('/dashboard/restaurant')
  const switchPath = isRestaurantDashboard
    ? '/dashboard/client'
    : '/dashboard/restaurant'
  const switchLabel = isRestaurantDashboard
    ? t('dashboard.switchToClient')
    : t('dashboard.switchToRestaurant')

  useEffect(() => {
    if (!user) return
    const currentRoles = user.roles ?? []
    const clientEnabled = currentRoles.includes('client')
    const restaurantEnabled = currentRoles.includes('restaurant')
    const clientData = user.clientData ?? {}
    const restaurantData = user.restaurantData ?? {}
    const preferences = Array.isArray(clientData.preferences)
      ? clientData.preferences
      : []

    setRoles({ client: clientEnabled, restaurant: restaurantEnabled })
    setLockedRoles({ client: clientEnabled, restaurant: restaurantEnabled })
    setForm({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
      paymentMethod: clientData.paymentMethod ?? '',
      preferences: {
        promo: preferences.includes('promo'),
        cheapest: preferences.includes('cheapest'),
        popular: preferences.includes('popular'),
      },
      restaurantName: restaurantData.name ?? '',
      restaurantPhone: restaurantData.phone ?? '',
      vat: restaurantData.vat ?? '',
      restaurantAddress: restaurantData.address ?? '',
    })
  }, [user])

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddressChange = (value) => {
    setForm((prev) => ({ ...prev, restaurantAddress: value }))
  }

  const handlePreferenceChange = (field) => (event) => {
    const checked = event.target.checked
    setForm((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: checked },
    }))
  }

  const handleRoleToggle = (role) => (event) => {
    if (lockedRoles[role]) return
    setRoles((prev) => ({ ...prev, [role]: event.target.checked }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!user?._id || isSubmitting) return

    const token = getJwt()
    if (!token) {
      setSubmitError(t('settings.updateError'))
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    const selectedRoles = Object.entries(roles)
      .filter(([, enabled]) => enabled)
      .map(([role]) => role)

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      roles: selectedRoles,
    }

    if (roles.client) {
      payload.clientData = {
        paymentMethod: form.paymentMethod,
        preferences: Object.entries(form.preferences)
          .filter(([, enabled]) => enabled)
          .map(([key]) => key),
      }
    }

    if (roles.restaurant) {
      payload.restaurantData = {
        name: form.restaurantName.trim(),
        phone: form.restaurantPhone.trim(),
        vat: form.vat.trim(),
        address: form.restaurantAddress.trim(),
      }
    }

    try {
      const updated = await updateUser(
        user._id,
        token,
        payload,
        t('settings.updateError')
      )
      onUserUpdate(updated)
      showToast({ type: 'success', message: t('settings.updateSuccess') })
    } catch (error) {
      setSubmitError(error.message || t('settings.updateError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!user?._id || isDeleting) return
    const token = getJwt()
    if (!token) {
      setSubmitError(t('settings.deleteError'))
      return
    }

    setIsDeleting(true)
    setSubmitError('')

    try {
      await updateUser(
        user._id,
        token,
        { active: false },
        t('settings.deleteError')
      )
      showToast({ type: 'success', message: t('settings.deleteSuccess') })
      setIsDeleteOpen(false)
      onLogout()
    } catch (error) {
      setSubmitError(error.message || t('settings.deleteError'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="landing settings">
      <Navbar t={t} lang={lang} onLangChange={onLangChange} />
      <Breadcrumbs
        t={t}
        backTo={backTo}
        items={[
          { label: t('dashboard.title'), to: backTo },
          { label: t('settings.title') },
        ]}
        userMenu={{
          settingsPath: '/settings',
          onLogout,
          showSwitch: canSwitch,
          switchPath,
          switchLabel,
        }}
      />
      <main>
        <div className="page">
          <section className="card authCard" aria-labelledby="settings-title">
            <div className="authHeader">
              <div>
                <h2 id="settings-title">{t('settings.title')}</h2>
                <p className="muted">{t('settings.subtitle')}</p>
              </div>
            </div>

            {!user ? (
            <p className="muted">
              <Spinner
                className="spinner--inline"
                label={t('settings.loading')}
              />
            </p>
            ) : (
              <form className="authForm" onSubmit={handleSubmit}>
                <div className="settingsGrid">
                  <div className="settingsProfile">
                    <div className="formGrid">
                      <label className="formField">
                        <span>{t('auth.firstName')}</span>
                        <input
                          className="input"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange('firstName')}
                          required
                        />
                      </label>
                      <label className="formField">
                        <span>{t('auth.lastName')}</span>
                        <input
                          className="input"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange('lastName')}
                          required
                        />
                      </label>
                    </div>

                    <label className="formField">
                      <span>{t('auth.email')}</span>
                      <input
                        className="input"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange('email')}
                        required
                      />
                    </label>
                  </div>

                  <fieldset className="formField formField--checkboxes settingsRoles">
                    <legend>{t('settings.roleLegend')}</legend>
                    <label className="checkboxRow">
                      <input
                        type="checkbox"
                        checked={roles.client}
                        onChange={handleRoleToggle('client')}
                        disabled={lockedRoles.client}
                      />
                      <span>{t('auth.roleClient')}</span>
                    </label>
                    <label className="checkboxRow">
                      <input
                        type="checkbox"
                        checked={roles.restaurant}
                        onChange={handleRoleToggle('restaurant')}
                        disabled={lockedRoles.restaurant}
                      />
                      <span>{t('auth.roleRestaurant')}</span>
                    </label>
                    <button
                      className="btn btn--danger settingsDeleteButton"
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setIsDeleteOpen(true)}
                    >
                      {t('settings.deleteProfile')}
                    </button>
                  </fieldset>
                </div>

                {roles.client && (
                  <div className="card subtleCard">
                    <h3 className="miniTitle">{t('auth.clientData')}</h3>
                    <label className="formField">
                      <span>{t('auth.paymentMethod')}</span>
                      <select
                        className="input"
                        name="paymentMethod"
                        value={form.paymentMethod}
                        onChange={handleChange('paymentMethod')}
                        required
                      >
                        <option value="">
                          {t('auth.paymentSelectPlaceholder')}
                        </option>
                        <option value="delivery">
                          {t('auth.paymentDelivery')}
                        </option>
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
                            checked={form.preferences.promo}
                            onChange={handlePreferenceChange('promo')}
                          />
                          <span>{t('auth.preferencePromo')}</span>
                        </label>
                        <label className="checkboxRow">
                          <input
                            type="checkbox"
                            name="preferences"
                            value="cheapest"
                            checked={form.preferences.cheapest}
                            onChange={handlePreferenceChange('cheapest')}
                          />
                          <span>{t('auth.preferenceCheapest')}</span>
                        </label>
                        <label className="checkboxRow">
                          <input
                            type="checkbox"
                            name="preferences"
                            value="popular"
                            checked={form.preferences.popular}
                            onChange={handlePreferenceChange('popular')}
                          />
                          <span>{t('auth.preferencePopular')}</span>
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
                        <input
                          className="input"
                          name="restaurantName"
                          value={form.restaurantName}
                          onChange={handleChange('restaurantName')}
                        />
                      </label>
                      <label className="formField">
                        <span>{t('auth.restaurantPhone')}</span>
                        <input
                          className="input"
                          name="restaurantPhone"
                          value={form.restaurantPhone}
                          onChange={handleChange('restaurantPhone')}
                        />
                      </label>
                    </div>
                    <div className="formGrid">
                      <label className="formField">
                        <span>{t('auth.vat')}</span>
                        <input
                          className="input"
                          name="vat"
                          value={form.vat}
                          onChange={handleChange('vat')}
                        />
                      </label>
                      <div className="formField formField--full">
                        <label htmlFor="restaurantAddress">
                          {t('auth.restaurantAddress')}
                        </label>
                        <AddressPicker
                          inputId="restaurantAddress"
                          value={form.restaurantAddress}
                          onChange={handleAddressChange}
                          t={t}
                          lang={lang}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="authFooter">
                  <button
                    className="btn btn--primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Spinner
                        className="spinner--button"
                        label={t('common.loading')}
                      />
                    ) : (
                      t('settings.submit')
                    )}
                  </button>
                  {submitError && (
                    <span className="tiny errorText" role="status">
                      {submitError}
                    </span>
                  )}
                </div>
              </form>
            )}
          </section>
        </div>
      </main>
      <Modal
        isOpen={isDeleteOpen}
        title={t('settings.deleteProfileTitle')}
        description={t('settings.deleteProfileDescription')}
        submitLabel={t('settings.deleteProfileConfirm')}
        cancelLabel={t('settings.deleteProfileCancel')}
        submitVariant="danger"
        onSubmit={handleDeleteConfirm}
        onCancel={() => (isDeleting ? null : setIsDeleteOpen(false))}
      />
    </div>
  )
}

export default Settings
