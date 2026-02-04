import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import MenuItemForm from '../components/MenuItemForm/MenuItemForm'
import Navbar from '../components/Navbar/Navbar'
import Spinner from '../components/Spinner/Spinner'
import mealCategories from '../constants/mealCategories'
import useToast from '../hooks/useToast'
import { getMeals } from '../services/meals'
import { addMenuItems, getMenuByRestaurantId } from '../services/menus'
import { getMealIngredients } from '../utils/meals'

function MenuAddItem({
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
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [menu, setMenu] = useState(null)
  const [menuError, setMenuError] = useState(null)
  const [isMenuLoading, setIsMenuLoading] = useState(false)
  const [meals, setMeals] = useState([])
  const [mealsError, setMealsError] = useState(null)
  const [isMealsLoading, setIsMealsLoading] = useState(false)
  const [selectedMealId, setSelectedMealId] = useState(null)
  const [isSavingMeal, setIsSavingMeal] = useState(false)
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
  }, [t, token])

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

  const selectedMeal = useMemo(() => {
    if (!selectedMealId) return null
    return meals.find((meal) => {
      const id = meal?._id?.toString() ?? meal?.idMeal?.toString()
      return id === selectedMealId
    })
  }, [meals, selectedMealId])

  const categoryOptions = useMemo(() => {
    const options = [...mealCategories]
    const current = selectedMeal?.strCategory
    if (current && !options.includes(current)) {
      options.push(current)
    }
    return options
  }, [selectedMeal])

  const ingredients = useMemo(
    () => getMealIngredients(selectedMeal),
    [selectedMeal]
  )

  useEffect(() => {
    if (!selectedMeal) {
      setEditPrice('')
      setEditCategory('')
      setRemovedIngredients([])
      setEditPhoto(null)
      setEditPhotoPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      return
    }

    setEditPrice('')
    setEditCategory(selectedMeal.strCategory ?? '')
    setRemovedIngredients([])
    setEditPhoto(null)
    setEditPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }, [selectedMeal])

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

  const hasDefaultPhoto = Boolean(selectedMeal?.strMealThumb)
  const isSelectionValid =
    selectedMeal &&
    editPrice !== '' &&
    editPrice !== null &&
    (editPhoto || hasDefaultPhoto)

  const handleSaveMeal = async () => {
    if (!selectedMeal || !isSelectionValid || isSavingMeal) return
    if (!restaurantId || !token) return

    setIsSavingMeal(true)
    try {
      const updated = await addMenuItems(
        restaurantId,
        token,
        [
          {
            mealId: selectedMealId,
            price: editPrice,
            category: editCategory || undefined,
            photo: editPhoto,
            removedIngredients,
          },
        ],
        t('dashboard.menuAddSaveError')
      )
      setMenu(updated)
      setSelectedMealId(null)
      showToast({ type: 'success', message: t('dashboard.menuAddSuccess') })
    } catch (error) {
      const message = error?.message ?? t('dashboard.menuAddSaveError')
      showToast({ type: 'error', message })
    } finally {
      setIsSavingMeal(false)
    }
  }

  const tableMeals = useMemo(() => {
    return meals
      .map((meal) => ({
        id: meal?._id?.toString() ?? meal?.idMeal?.toString() ?? '',
        name: meal?.strMeal ?? '—',
        category: meal?.strCategory ?? '—',
        imageUrl: meal?.strMealThumb ?? null,
        raw: meal,
      }))
      .filter((meal) => meal.id && !existingMealIds.has(meal.id))
  }, [existingMealIds, meals])

  return (
    <div className="landing dashboard">
      <Navbar t={t} lang={lang} onLangChange={onLangChange} />
      <Breadcrumbs
        t={t}
        backTo="/dashboard/restaurant"
        items={[
          { label: t('dashboard.menuTitle'), to: '/dashboard/restaurant' },
          { label: t('dashboard.menuAddTitle') },
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
                <h2>{t('dashboard.menuAddTitle')}</h2>
                <p className="muted">{t('dashboard.menuAddDescription')}</p>
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
            {(isMenuLoading || isMealsLoading) && (
              <p className="muted">
                <Spinner
                  className="spinner--inline"
                  label={t('common.loading')}
                />
              </p>
            )}
            {menuError && <p className="menuError">{menuError}</p>}
            {mealsError && <p className="menuError">{mealsError}</p>}
            {!isMealsLoading && meals.length === 0 && !mealsError && (
              <p className="muted">{t('dashboard.menuAddEmpty')}</p>
            )}
            {!isMealsLoading && meals.length > 0 && tableMeals.length === 0 && (
              <p className="muted">{t('dashboard.menuAddAllAdded')}</p>
            )}
            {!isMealsLoading && tableMeals.length > 0 && (
              <div className="menuTableWrapper">
                <table className="menuTable">
                  <thead>
                    <tr>
                      <th>{t('dashboard.menuTableImage')}</th>
                      <th>{t('dashboard.menuTableName')}</th>
                      <th>{t('dashboard.menuTableType')}</th>
                      <th>{t('dashboard.menuAddStatus')}</th>
                    </tr>
                  </thead>
                  {tableMeals.map((meal) => {
                    const isAlreadyAdded = existingMealIds.has(meal.id)
                    const isSelected = meal.id === selectedMealId
                    return (
                      <tbody key={meal.id}>
                        <tr
                          className={`menuRow ${
                            isAlreadyAdded ? 'menuRow--disabled' : ''
                          } ${isSelected ? 'menuRow--selected' : ''}`}
                        >
                          <td>
                            <div className="menuThumb">
                              {meal.imageUrl ? (
                                <img src={meal.imageUrl} alt={meal.name} />
                              ) : (
                                <span>{t('dashboard.menuNoImage')}</span>
                              )}
                            </div>
                          </td>
                          <td>{meal.name}</td>
                          <td>{meal.category}</td>
                          <td>
                            <button
                              className="btn btn--secondary menuRow__action"
                              type="button"
                              disabled={isAlreadyAdded}
                              onClick={() => {
                                if (isAlreadyAdded) return
                                setSelectedMealId((prev) =>
                                  prev === meal.id ? null : meal.id
                                )
                              }}
                            >
                              {isAlreadyAdded
                                ? t('dashboard.menuAddAlready')
                                : isSelected
                                  ? t('dashboard.menuAddSelected')
                                  : t('dashboard.menuAddSelect')}
                            </button>
                          </td>
                        </tr>
                        {isSelected && (
                          <tr className="menuRow__accordion">
                            <td colSpan={4}>
                              <div className="menuAccordion">
                                <div className="menuHeader">
                                  <div>
                                    <h3>{selectedMeal?.strMeal}</h3>
                                    <p className="muted">
                                      {t('dashboard.menuAddFormHint')}
                                    </p>
                                  </div>
                                </div>
                                <MenuItemForm
                                  t={t}
                                  imageUrl={selectedMeal?.strMealThumb ?? null}
                                  photoPreview={editPhotoPreview}
                                  onPhotoChange={setEditPhotoFile}
                                  photoHint={t('dashboard.menuAddPhotoHint')}
                                  price={editPrice}
                                  onPriceChange={setEditPrice}
                                  category={editCategory}
                                  onCategoryChange={setEditCategory}
                                  categories={categoryOptions}
                                  ingredients={ingredients}
                                  removedIngredients={removedIngredients}
                                  onRemovedIngredientsChange={setRemovedIngredients}
                                  ingredientsLabel={t('dashboard.menuAddIngredients')}
                                  ingredientsHint={t('dashboard.menuAddIngredientsHint')}
                                  originLabel={t('dashboard.menuDetailOrigin')}
                                  originValue={t('dashboard.menuOriginCatalog')}
                                  showOrigin
                                  isSubmitting={isSavingMeal}
                                  submitLabel={
                                    isSavingMeal
                                      ? t('dashboard.menuAddSaving')
                                      : t('dashboard.menuAddConfirm')
                                  }
                                  disableSubmit={!isSelectionValid}
                                  onSubmit={handleSaveMeal}
                                  showEmptyCategory={!selectedMeal?.strCategory}
                                />
                                {!isSelectionValid && (
                                  <>
                                    {editPrice === '' && (
                                      <p className="menuError">
                                        {t('dashboard.menuAddMissingPrice')}
                                      </p>
                                    )}
                                    {!editPhoto && !hasDefaultPhoto && (
                                      <p className="menuError">
                                        {t('dashboard.menuAddMissingPhoto')}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    )
                  })}
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default MenuAddItem
