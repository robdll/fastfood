import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import Navbar from '../components/Navbar/Navbar'
import mealCategories from '../constants/mealCategories'
import useToast from '../hooks/useToast'
import { getMenuByRestaurantId, updateMenuItem } from '../services/menus'

function MenuItemDetail({
  user,
  token,
  lang,
  onLangChange,
  onLogout,
  canSwitch,
  switchPath,
  t,
}) {
  const restaurantId = user?._id ?? null
  const { itemId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [menu, setMenu] = useState(null)
  const [menuError, setMenuError] = useState(null)
  const [isMenuLoading, setIsMenuLoading] = useState(false)
  const [isUpdatingItem, setIsUpdatingItem] = useState(false)
  const [updateError, setUpdateError] = useState(null)
  const [editPrice, setEditPrice] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editPhoto, setEditPhoto] = useState(null)
  const [editPhotoPreview, setEditPhotoPreview] = useState(null)

  useEffect(() => {
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
  }, [restaurantId, t, token])

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
        mealId: item?.mealId ?? item?.meal?._id ?? item?.idMeal ?? null,
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

  const menuItem = useMemo(() => {
    if (!itemId) return null
    return menuItems.find((item) => {
      const candidates = [item.id, item.mealId]
      return candidates
        .filter(Boolean)
        .some((value) => value.toString() === itemId.toString())
    })
  }, [itemId, menuItems])

  const categoryOptions = useMemo(() => {
    const options = [...mealCategories]
    const current = menuItem?.category
    if (current && !options.includes(current)) {
      options.push(current)
    }
    return options
  }, [menuItem])
  const showEmptyCategory = !menuItem?.category

  useEffect(() => {
    if (!menuItem) {
      setEditPrice('')
      setEditCategory('')
      setEditPhoto(null)
      setEditPhotoPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      setUpdateError(null)
      setIsUpdatingItem(false)
      return
    }

    setEditPrice(menuItem.price ?? '')
    setEditCategory(menuItem.category ?? '')
    setEditPhoto(null)
    setEditPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setUpdateError(null)
    setIsUpdatingItem(false)
  }, [menuItem])

  useEffect(() => {
    return () => {
      if (editPhotoPreview) URL.revokeObjectURL(editPhotoPreview)
    }
  }, [editPhotoPreview])

  const setEditPhotoFile = (file) => {
    setEditPhoto(file ?? null)
    setEditPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return file ? URL.createObjectURL(file) : null
    })
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
  const hasEditPrice =
    editPrice !== '' && editPrice !== null && editPrice !== undefined
  const hasPriceUpdate =
    menuItem &&
    hasEditPrice &&
    Number(editPrice) !== Number(menuItem.price ?? '')
  const hasCategoryUpdate =
    menuItem && editCategory !== (menuItem.category ?? '')
  const canUpdateItem =
    Boolean(menuItem) &&
    hasEditPrice &&
    (hasPriceUpdate || editPhoto || hasCategoryUpdate)

  const handleUpdateMenuItem = async () => {
    if (!menuItem || isUpdatingItem) return
    if (!restaurantId || !token) return
    if (!hasEditPrice) return
    if (!hasPriceUpdate && !editPhoto && !hasCategoryUpdate) return

    setIsUpdatingItem(true)
    setUpdateError(null)
    try {
      const updated = await updateMenuItem(
        restaurantId,
        menuItem.mealId ?? menuItem.id,
        token,
        {
          price: hasPriceUpdate ? editPrice : undefined,
          photo: editPhoto ?? undefined,
          category: hasCategoryUpdate ? editCategory : undefined,
        },
        t('dashboard.menuDetailUpdateError')
      )
      setMenu(updated)
      setEditPhotoFile(null)
      showToast({
        type: 'success',
        message: t('dashboard.menuDetailUpdateSuccess'),
      })
    } catch (error) {
      const message = error?.message ?? t('dashboard.menuDetailUpdateError')
      setUpdateError(message)
      showToast({ type: 'error', message })
    } finally {
      setIsUpdatingItem(false)
    }
  }

  return (
    <div className="landing dashboard">
      <Navbar t={t} lang={lang} onLangChange={onLangChange} />
      <Breadcrumbs
        t={t}
        backTo="/dashboard/restaurant"
        items={[
          { label: t('dashboard.menuTitle'), to: '/dashboard/restaurant' },
          {
            label: menuItem?.name ?? t('dashboard.menuDetailTitle'),
          },
        ]}
        userMenu={{
          settingsPath: '/settings',
          onLogout,
          showSwitch: canSwitch,
          switchPath,
          switchLabel: t('dashboard.switchToClient'),
        }}
      />
      <main>
        <div className="page">
          <section className="card menuCard">
            <div className="menuHeader">
              <div>
                <h2>{t('dashboard.menuDetailTitle')}</h2>
                <p className="muted">{t('dashboard.menuDetailBody')}</p>
              </div>
              <div className="menuActions">
                <button
                  className="btn btn--secondary"
                  type="button"
                  onClick={() => navigate('/dashboard/restaurant')}
                >
                  {t('dashboard.menuDetailBack')}
                </button>
              </div>
            </div>
            {isMenuLoading && (
              <p className="muted">{t('dashboard.menuLoading')}</p>
            )}
            {menuError && <p className="menuError">{menuError}</p>}
            {!isMenuLoading && !menuError && !menuItem && (
              <p className="menuError">{t('dashboard.menuDetailNotFound')}</p>
            )}
            {menuItem && (
              <div className="menuDetail">
                <div className="menuDetail__layout">
                  <div className="menuDetail__image">
                    <label
                      className="menuDetail__imagePicker"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault()
                        const file = event.dataTransfer?.files?.[0]
                        if (!file) return
                        setEditPhotoFile(file)
                      }}
                    >
                      <input
                        className="menuDetail__imageInput"
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          setEditPhotoFile(event.target.files?.[0] ?? null)
                        }
                      />
                      {editPhotoPreview ? (
                        <img src={editPhotoPreview} alt={menuItem.name} />
                      ) : menuItem.imageUrl ? (
                        <img src={menuItem.imageUrl} alt={menuItem.name} />
                      ) : (
                        <div className="menuThumb menuThumb--large">
                          <span>{t('dashboard.menuNoImage')}</span>
                        </div>
                      )}
                      <span className="menuDetail__imageHint">
                        {t('dashboard.menuDetailUpdatePhotoHint')}
                      </span>
                    </label>
                  </div>
                  <div className="menuDetail__panel">
                    <div className="menuDetail__formGrid">
                      <label className="mealField">
                        <span>{t('dashboard.menuDetailPrice')}</span>
                        <input
                          className="input"
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={editPrice}
                          onChange={(event) => setEditPrice(event.target.value)}
                        />
                      </label>
                      <label className="mealField">
                        <span>{t('dashboard.menuDetailOrigin')}</span>
                        <input
                          className="input"
                          type="text"
                          value={getOriginLabel(menuItem.origin)}
                          readOnly
                        />
                      </label>
                      <label className="mealField">
                        <span>{t('dashboard.menuDetailCategory')}</span>
                        <select
                          className="input"
                          value={editCategory}
                          onChange={(event) => setEditCategory(event.target.value)}
                        >
                          {showEmptyCategory && <option value="">{'—'}</option>}
                          {categoryOptions.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    {updateError && <p className="menuError">{updateError}</p>}
                    <div className="menuDetail__actions">
                      <button
                        className="btn btn--primary"
                        type="button"
                        onClick={handleUpdateMenuItem}
                        disabled={!canUpdateItem || isUpdatingItem}
                      >
                        {isUpdatingItem
                          ? t('dashboard.menuDetailUpdateSaving')
                          : t('dashboard.menuDetailUpdateAction')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default MenuItemDetail
