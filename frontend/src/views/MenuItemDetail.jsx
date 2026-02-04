import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import MenuItemForm from '../components/MenuItemForm/MenuItemForm'
import Navbar from '../components/Navbar/Navbar'
import mealCategories from '../constants/mealCategories'
import useToast from '../hooks/useToast'
import { getMeals } from '../services/meals'
import { getMenuByRestaurantId, updateMenuItem } from '../services/menus'
import { getMealIngredients } from '../utils/meals'

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
  const [catalogMeals, setCatalogMeals] = useState([])
  const [isUpdatingItem, setIsUpdatingItem] = useState(false)
  const [updateError, setUpdateError] = useState(null)
  const [editPrice, setEditPrice] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [removedIngredients, setRemovedIngredients] = useState([])
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

  useEffect(() => {
    if (!token) return undefined

    let cancelled = false

    async function loadMeals() {
      try {
        const data = await getMeals(token, t('dashboard.menuAddError'))
        if (!cancelled) setCatalogMeals(data ?? [])
      } catch (error) {
        if (!cancelled) setCatalogMeals([])
      }
    }

    loadMeals()
    return () => {
      cancelled = true
    }
  }, [t, token])

  const menuItems = useMemo(() => {
    const items = menu?.items ?? []
    return items.map((item, index) => {
      const origin =
        item?.origin ??
        item?.source ??
        (item?.mealId || item?.meal ? 'catalog' : 'custom')
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
        price,
        origin,
        imageUrl,
        category: item?.category ?? item?.mealCategory ?? null,
        removedIngredients: item?.removedIngredients ?? [],
        ingredients: item?.ingredients ?? null,
        measures: item?.measures ?? null,
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

  const matchedMeal = useMemo(() => {
    if (!menuItem) return null
    return (
      catalogMeals.find((meal) => {
        const id = meal?._id?.toString() ?? meal?.idMeal?.toString()
        return id && (id === menuItem.mealId || id === menuItem.id)
      }) ?? null
    )
  }, [catalogMeals, menuItem])

  const ingredients = useMemo(() => {
    if (!menuItem) return []
    if (Array.isArray(menuItem.ingredients) && menuItem.ingredients.length > 0) {
      return getMealIngredients(menuItem)
    }
    return getMealIngredients(matchedMeal)
  }, [matchedMeal, menuItem])

  const youtubeUrl = useMemo(() => {
    const value =
      menuItem?.raw?.strYoutube ??
      menuItem?.raw?.youtube ??
      menuItem?.strYoutube ??
      matchedMeal?.strYoutube ??
      matchedMeal?.youtube ??
      null
    return value?.toString().trim() || ''
  }, [matchedMeal, menuItem])

  const sourceUrl = useMemo(() => {
    const value =
      menuItem?.raw?.strSource ?? menuItem?.strSource ?? matchedMeal?.strSource ?? null
    return value?.toString().trim() || ''
  }, [matchedMeal, menuItem])

  const normalizedRemovedIngredients = useMemo(
    () =>
      (removedIngredients ?? [])
        .map((item) => item?.toString().trim())
        .filter(Boolean)
        .sort(),
    [removedIngredients]
  )

  const initialRemovedIngredients = useMemo(
    () =>
      (menuItem?.removedIngredients ?? [])
        .map((item) => item?.toString().trim())
        .filter(Boolean)
        .sort(),
    [menuItem]
  )

  useEffect(() => {
    if (!menuItem) {
      setEditPrice('')
      setEditCategory('')
      setRemovedIngredients([])
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
    setRemovedIngredients(menuItem.removedIngredients ?? [])
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
  const hasRemovedIngredientsUpdate =
    JSON.stringify(normalizedRemovedIngredients) !==
    JSON.stringify(initialRemovedIngredients)
  const canUpdateItem =
    Boolean(menuItem) &&
    hasEditPrice &&
    (hasPriceUpdate || editPhoto || hasCategoryUpdate || hasRemovedIngredientsUpdate)

  const handleUpdateMenuItem = async () => {
    if (!menuItem || isUpdatingItem) return
    if (!restaurantId || !token) return
    if (!hasEditPrice) return
    if (!hasPriceUpdate && !editPhoto && !hasCategoryUpdate && !hasRemovedIngredientsUpdate) {
      return
    }

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
          removedIngredients: hasRemovedIngredientsUpdate
            ? normalizedRemovedIngredients
            : undefined,
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
              <>
                <MenuItemForm
                  t={t}
                  imageUrl={menuItem.imageUrl}
                  photoPreview={editPhotoPreview}
                  onPhotoChange={setEditPhotoFile}
                  photoHint={t('dashboard.menuDetailUpdatePhotoHint')}
                  price={editPrice}
                  onPriceChange={setEditPrice}
                  category={editCategory}
                  onCategoryChange={setEditCategory}
                  categories={categoryOptions}
                  ingredients={ingredients}
                  removedIngredients={removedIngredients}
                  onRemovedIngredientsChange={setRemovedIngredients}
                  ingredientsLabel={t('dashboard.menuDetailIngredients')}
                  ingredientsHint={t('dashboard.menuDetailIngredientsHint')}
                  youtubeUrl={youtubeUrl}
                  sourceUrl={sourceUrl}
                  originLabel={t('dashboard.menuDetailOrigin')}
                  originValue={getOriginLabel(menuItem.origin)}
                  showOrigin
                  isSubmitting={isUpdatingItem}
                  submitLabel={
                    isUpdatingItem
                      ? t('dashboard.menuDetailUpdateSaving')
                      : t('dashboard.menuDetailUpdateAction')
                  }
                  disableSubmit={!canUpdateItem}
                  onSubmit={handleUpdateMenuItem}
                  showEmptyCategory={showEmptyCategory}
                />
                {updateError && <p className="menuError">{updateError}</p>}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default MenuItemDetail
