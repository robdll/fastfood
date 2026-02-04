import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import Modal from '../components/Modal/Modal'
import Navbar from '../components/Navbar/Navbar'
import { getMeals } from '../services/meals'
import { addMenuItems, getMenuByRestaurantId } from '../services/menus'

function Dashboard({
  variant = 'client',
  canSwitch,
  switchPath,
  onLogout,
  user,
  token,
  lang,
  onLangChange,
  t,
}) {
  const isClient = variant === 'client'
  const restaurantId = user?._id ?? null
  const title = isClient
    ? t('dashboard.clientTitle')
    : t('dashboard.restaurantTitle')
  const body = isClient
    ? t('dashboard.clientBody')
    : t('dashboard.restaurantBody')
  const switchLabel = isClient
    ? t('dashboard.switchToRestaurant')
    : t('dashboard.switchToClient')
  const [menu, setMenu] = useState(null)
  const [menuError, setMenuError] = useState(null)
  const [isMenuLoading, setIsMenuLoading] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [meals, setMeals] = useState([])
  const [mealsError, setMealsError] = useState(null)
  const [isMealsLoading, setIsMealsLoading] = useState(false)
  const [selectedMeals, setSelectedMeals] = useState([])
  const [isSavingMeals, setIsSavingMeals] = useState(false)
  const [activeMenuItem, setActiveMenuItem] = useState(null)

  useEffect(() => {
    if (isClient) return undefined
    if (!token || !restaurantId) {
      setMenu(null)
      return undefined
    }

    let cancelled = false

    async function loadMenu() {
      setIsMenuLoading(true)
      setMenuError(null)
      try {
        const data = await getMenuByRestaurantId(
          restaurantId,
          token,
          t('dashboard.menuError')
        )
        if (!cancelled) setMenu(data)
      } catch (error) {
        if (!cancelled) {
          setMenu(null)
          setMenuError(error?.message ?? t('dashboard.menuError'))
        }
      } finally {
        if (!cancelled) setIsMenuLoading(false)
      }
    }

    loadMenu()
    return () => {
      cancelled = true
    }
  }, [isClient, restaurantId, t, token])

  useEffect(() => {
    if (!isAddModalOpen) return undefined
    if (!token) return undefined

    let cancelled = false

    async function loadMeals() {
      setIsMealsLoading(true)
      setMealsError(null)
      try {
        const data = await getMeals(token, t('dashboard.menuAddError'))
        if (!cancelled) setMeals(data ?? [])
      } catch (error) {
        if (!cancelled) {
          setMeals([])
          setMealsError(error?.message ?? t('dashboard.menuAddError'))
        }
      } finally {
        if (!cancelled) setIsMealsLoading(false)
      }
    }

    loadMeals()
    return () => {
      cancelled = true
    }
  }, [isAddModalOpen, t, token])

  const menuItems = useMemo(() => {
    const items = menu?.items ?? []
    return items.map((item, index) => {
      const origin =
        item?.origin ??
        item?.source ??
        (item?.mealId || item?.meal ? 'catalog' : 'custom')
      const type =
        item?.type ?? (origin === 'catalog' ? 'catalog' : 'custom')
      const name =
        item?.name ??
        item?.title ??
        item?.label ??
        item?.mealName ??
        '—'
      const price = item?.price ?? item?.cost ?? item?.amount ?? null
      const imageUrl =
        item?.photoUrl ?? item?.photo?.url ?? item?.imageUrl ?? item?.image ?? null
      return {
        id: item?._id ?? item?.mealId ?? `${origin}-${index}`,
        name,
        type,
        price,
        origin,
        imageUrl,
        category: item?.category ?? item?.mealCategory ?? null,
        raw: item,
      }
    })
  }, [menu])

  const existingMealIds = useMemo(() => {
    const ids = new Set()
    ;(menu?.items ?? []).forEach((item) => {
      const candidates = [
        item?.mealId,
        item?.meal?._id,
        item?.meal?.idMeal,
        item?.idMeal,
      ]
      candidates
        .filter(Boolean)
        .map((value) => value.toString())
        .forEach((value) => ids.add(value))
    })
    return ids
  }, [menu])

  const toggleMealSelection = (mealId) => {
    setSelectedMeals((prev) => {
      const existing = prev.find((item) => item.mealId === mealId)
      if (existing) {
        if (existing.photoPreview) {
          URL.revokeObjectURL(existing.photoPreview)
        }
        return prev.filter((item) => item.mealId !== mealId)
      }
      return [
        ...prev,
        { mealId, price: '', photo: null, photoPreview: null },
      ]
    })
  }

  const updateMealSelection = (mealId, updates) => {
    setSelectedMeals((prev) =>
      prev.map((item) =>
        item.mealId === mealId
          ? {
              ...item,
              ...updates,
              photoPreview:
                updates.photo !== undefined
                  ? updates.photo
                    ? (() => {
                        if (item.photoPreview) {
                          URL.revokeObjectURL(item.photoPreview)
                        }
                        return URL.createObjectURL(updates.photo)
                      })()
                    : (() => {
                        if (item.photoPreview) {
                          URL.revokeObjectURL(item.photoPreview)
                        }
                        return null
                      })()
                  : item.photoPreview,
            }
          : item
      )
    )
  }

  const clearSelectedMeals = () => {
    setSelectedMeals((prev) => {
      prev.forEach((item) => {
        if (item.photoPreview) URL.revokeObjectURL(item.photoPreview)
      })
      return []
    })
  }

  const isSelectionValid =
    selectedMeals.length > 0 &&
    selectedMeals.every(
      (item) => item.price !== '' && item.price !== null && item.price !== undefined
    )

  const handleSaveMeals = async () => {
    if (isSavingMeals || !isSelectionValid) return
    if (!restaurantId || !token) return
    setIsSavingMeals(true)
    try {
      const updated = await addMenuItems(
        restaurantId,
        token,
        selectedMeals,
        t('dashboard.menuAddSaveError')
      )
      setMenu(updated)
      clearSelectedMeals()
      setIsAddModalOpen(false)
    } catch (error) {
      setMealsError(error?.message ?? t('dashboard.menuAddSaveError'))
    } finally {
      setIsSavingMeals(false)
    }
  }

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === '') return '—'
    const numeric = Number(value)
    if (!Number.isNaN(numeric)) {
      try {
        return new Intl.NumberFormat(lang, {
          style: 'currency',
          currency: 'EUR',
        }).format(numeric)
      } catch (error) {
        return `€ ${numeric}`
      }
    }
    return value.toString()
  }

  const getOriginLabel = (origin) =>
    origin === 'catalog'
      ? t('dashboard.menuOriginCatalog')
      : t('dashboard.menuOriginCustom')
  const getTypeLabel = (type) =>
    type === 'catalog'
      ? t('dashboard.menuTypeCatalog')
      : t('dashboard.menuTypeCustom')

  return (
    <div className="landing dashboard">
      <Navbar t={t} lang={lang} onLangChange={onLangChange} />
      <Breadcrumbs
        t={t}
        items={[{ label: title }]}
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
          {isClient && (
            <section className="card">
              <h2>{title}</h2>
              <p className="muted">{body}</p>
              {canSwitch && switchPath && (
                <Link className="btn btn--secondary" to={switchPath}>
                  {switchLabel}
                </Link>
              )}
            </section>
          )}
          {!isClient && (
            <section className="card menuCard">
              <div className="menuHeader">
                <div>
                  <h2>{t('dashboard.menuTitle')}</h2>
                  <p className="muted">{t('dashboard.menuBody')}</p>
                </div>
                <div className="menuActions">
                  <button
                    className="btn btn--secondary"
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    {t('dashboard.menuAddButton')}
                  </button>
                </div>
              </div>
              {isMenuLoading && (
                <p className="muted">{t('dashboard.menuLoading')}</p>
              )}
              {menuError && <p className="menuError">{menuError}</p>}
              <div className="menuTableWrapper">
                <table className="menuTable">
                  <thead>
                    <tr>
                      <th>{t('dashboard.menuTableImage')}</th>
                      <th>{t('dashboard.menuTableName')}</th>
                      <th>{t('dashboard.menuTableType')}</th>
                      <th>{t('dashboard.menuTablePrice')}</th>
                      <th>{t('dashboard.menuTableOrigin')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!isMenuLoading && menuItems.length === 0 ? (
                      <tr>
                        <td className="menuEmpty" colSpan={5}>
                          {t('dashboard.menuEmpty')}
                        </td>
                      </tr>
                    ) : (
                      menuItems.map((item) => (
                        <tr
                          key={item.id}
                          className="menuRow"
                          onClick={() => setActiveMenuItem(item)}
                        >
                          <td>
                            <div className="menuThumb">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} />
                              ) : (
                                <span>{t('dashboard.menuNoImage')}</span>
                              )}
                            </div>
                          </td>
                          <td>{item.name}</td>
                          <td>{getTypeLabel(item.type)}</td>
                          <td>{formatPrice(item.price)}</td>
                          <td>{getOriginLabel(item.origin)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>
      <Modal
        isOpen={!isClient && isAddModalOpen}
        title={t('dashboard.menuAddTitle')}
        description={t('dashboard.menuAddDescription')}
        submitLabel={
          isSavingMeals
            ? t('dashboard.menuAddSaving')
            : t('dashboard.menuAddConfirm')
        }
        cancelLabel={t('dashboard.menuAddCancel')}
        onSubmit={handleSaveMeals}
        onCancel={() => {
          if (isSavingMeals) return
          setIsAddModalOpen(false)
          clearSelectedMeals()
        }}
        submitVariant="primary"
        cancelVariant="secondary"
      >
        {isMealsLoading && (
          <p className="muted">{t('dashboard.menuAddLoading')}</p>
        )}
        {mealsError && <p className="menuError">{mealsError}</p>}
        {!isMealsLoading && meals.length === 0 && !mealsError && (
          <p className="muted">{t('dashboard.menuAddEmpty')}</p>
        )}
        {!isMealsLoading && meals.length > 0 && (
          <div className="mealList">
            {meals.map((meal) => {
              const mealId = meal?._id?.toString() ?? meal?.idMeal?.toString()
              if (!mealId) return null
              const isAlreadyAdded = existingMealIds.has(mealId)
              const selected = selectedMeals.find(
                (item) => item.mealId === mealId
              )
              return (
                <label
                  key={mealId}
                  className={`mealItem ${
                    isAlreadyAdded ? 'mealItem--disabled' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(selected)}
                    disabled={isAlreadyAdded || isSavingMeals}
                    onChange={() => toggleMealSelection(mealId)}
                  />
                  <span className="mealItem__name">{meal.strMeal}</span>
                  {meal.strCategory && (
                    <span className="mealItem__meta">{meal.strCategory}</span>
                  )}
                  {isAlreadyAdded && (
                    <span className="mealItem__meta">
                      {t('dashboard.menuAddAlready')}
                    </span>
                  )}
                  {selected && !isAlreadyAdded && (
                    <div className="mealItem__fields">
                      <label className="mealField">
                        <span>{t('dashboard.menuAddPrice')}</span>
                        <input
                          className="input"
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={selected.price}
                          onChange={(event) =>
                            updateMealSelection(mealId, {
                              price: event.target.value,
                            })
                          }
                        />
                      </label>
                      <div className="mealField">
                        <span>{t('dashboard.menuAddPhoto')}</span>
                        <label
                          className="photoDrop"
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            event.preventDefault()
                            const file = event.dataTransfer?.files?.[0]
                            if (!file) return
                            updateMealSelection(mealId, { photo: file })
                          }}
                        >
                          <input
                            className="photoDrop__input"
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                              updateMealSelection(mealId, {
                                photo: event.target.files?.[0] ?? null,
                              })
                            }
                          />
                          {selected.photoPreview ? (
                            <img
                              className="photoDrop__preview"
                              src={selected.photoPreview}
                              alt={meal.strMeal}
                            />
                          ) : (
                            <span className="photoDrop__text">
                              {t('dashboard.menuAddPhotoHint')}
                            </span>
                          )}
                        </label>
                      </div>
                    </div>
                  )}
                </label>
              )
            })}
          </div>
        )}
        {!isSelectionValid && selectedMeals.length > 0 && (
          <p className="menuError">{t('dashboard.menuAddMissingPrice')}</p>
        )}
      </Modal>
      <Modal
        isOpen={!isClient && Boolean(activeMenuItem)}
        title={activeMenuItem?.name}
        cancelLabel={t('dashboard.menuDetailClose')}
        onCancel={() => setActiveMenuItem(null)}
      >
        {activeMenuItem && (
          <div className="menuDetail">
            <div className="menuDetail__image">
              {activeMenuItem.imageUrl ? (
                <img
                  src={activeMenuItem.imageUrl}
                  alt={activeMenuItem.name}
                />
              ) : (
                <div className="menuThumb menuThumb--large">
                  <span>{t('dashboard.menuNoImage')}</span>
                </div>
              )}
            </div>
            <div className="menuDetail__grid">
              <div>
                <span className="menuDetail__label">
                  {t('dashboard.menuDetailPrice')}
                </span>
                <span>{formatPrice(activeMenuItem.price)}</span>
              </div>
              <div>
                <span className="menuDetail__label">
                  {t('dashboard.menuDetailType')}
                </span>
                <span>{getTypeLabel(activeMenuItem.type)}</span>
              </div>
              <div>
                <span className="menuDetail__label">
                  {t('dashboard.menuDetailOrigin')}
                </span>
                <span>{getOriginLabel(activeMenuItem.origin)}</span>
              </div>
              {activeMenuItem.category && (
                <div>
                  <span className="menuDetail__label">
                    {t('dashboard.menuDetailCategory')}
                  </span>
                  <span>{activeMenuItem.category}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Dashboard
