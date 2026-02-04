import { useEffect, useMemo, useState } from 'react'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import Navbar from '../components/Navbar/Navbar'
import MenuItemForm from '../components/MenuItemForm/MenuItemForm'
import Spinner from '../components/Spinner/Spinner'
import mealCategories from '../constants/mealCategories'
import useToast from '../hooks/useToast'
import { createMeal, getMeals } from '../services/meals'
import { addMenuItems } from '../services/menus'
import { getMealIngredients } from '../utils/meals'

function MenuCreateItem({
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
  const { showToast } = useToast()
  const [meals, setMeals] = useState([])
  const [mealsError, setMealsError] = useState(null)
  const [isMealsLoading, setIsMealsLoading] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createPrice, setCreatePrice] = useState('')
  const [createCategory, setCreateCategory] = useState('')
  const [createIngredients, setCreateIngredients] = useState([])
  const [createPhoto, setCreatePhoto] = useState(null)
  const [createPhotoPreview, setCreatePhotoPreview] = useState(null)
  const [isCreatingMeal, setIsCreatingMeal] = useState(false)

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

  useEffect(() => {
    return () => {
      if (createPhotoPreview) URL.revokeObjectURL(createPhotoPreview)
    }
  }, [createPhotoPreview])

  const setCreatePhotoFile = (file) => {
    setCreatePhoto(file ?? null)
    setCreatePhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return file ? URL.createObjectURL(file) : null
    })
  }

  const ingredientOptions = useMemo(() => {
    const options = new Set()
    meals.forEach((meal) => {
      getMealIngredients(meal).forEach((item) => {
        if (item.name) options.add(item.name)
      })
    })
    return Array.from(options).sort((a, b) => a.localeCompare(b))
  }, [meals])

  const isCreateValid =
    createName.trim() !== '' &&
    createPrice !== '' &&
    createPrice !== null &&
    createCategory.trim() !== '' &&
    createIngredients.length > 0 &&
    Boolean(createPhoto)

  const resetCreateForm = () => {
    setCreateName('')
    setCreatePrice('')
    setCreateCategory('')
    setCreateIngredients([])
    setCreatePhoto(null)
    setCreatePhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }

  const handleCreateMeal = async () => {
    if (!isCreateValid || isCreatingMeal) return
    if (!restaurantId || !token) return

    setIsCreatingMeal(true)
    try {
      const createdMeal = await createMeal(
        token,
        {
          name: createName.trim(),
          category: createCategory.trim(),
          ingredients: createIngredients,
          photo: createPhoto,
          origin: restaurantId,
        },
        t('dashboard.menuCreateError')
      )
      const mealId =
        createdMeal?._id?.toString() ?? createdMeal?.idMeal?.toString()
      if (!mealId) {
        throw new Error(t('dashboard.menuCreateError'))
      }
      await addMenuItems(
        restaurantId,
        token,
        [
          {
            mealId,
            price: createPrice,
            category: createCategory.trim(),
            removedIngredients: [],
          },
        ],
        t('dashboard.menuAddSaveError')
      )
      resetCreateForm()
      showToast({ type: 'success', message: t('dashboard.menuCreateSuccess') })
    } catch (error) {
      const message = error?.message ?? t('dashboard.menuCreateError')
      showToast({ type: 'error', message })
    } finally {
      setIsCreatingMeal(false)
    }
  }

  return (
    <div className="landing dashboard">
      <Navbar t={t} lang={lang} onLangChange={onLangChange} />
      <Breadcrumbs
        t={t}
        backTo="/dashboard/restaurant/menu/add"
        items={[
          { label: t('dashboard.menuTitle'), to: '/dashboard/restaurant' },
          { label: t('dashboard.menuAddTitle'), to: '/dashboard/restaurant/menu/add' },
          { label: t('dashboard.menuCreateBreadcrumb') },
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
            <div className="menuCreate">
              <h3 className="menuCreate__title">
                {t('dashboard.menuCreateTitle')}
              </h3>
              <p className="muted menuCreate__subtitle">
                {t('dashboard.menuCreateDescription')}
              </p>
              {(isMealsLoading || isCreatingMeal) && (
                <p className="muted">
                  <Spinner
                    className="spinner--inline"
                    label={t('common.loading')}
                  />
                </p>
              )}
              {mealsError && <p className="menuError">{mealsError}</p>}
              <MenuItemForm
                t={t}
                nameLabel={t('dashboard.menuCreateName')}
                name={createName}
                onNameChange={setCreateName}
                imageUrl={null}
                photoPreview={createPhotoPreview}
                onPhotoChange={setCreatePhotoFile}
                photoHint={t('dashboard.menuAddPhotoHint')}
                price={createPrice}
                onPriceChange={setCreatePrice}
                category={createCategory}
                onCategoryChange={setCreateCategory}
                categories={mealCategories}
                ingredientsLabel={t('dashboard.menuCreateIngredients')}
                ingredientsHint={t('dashboard.menuCreateIngredientsHint')}
                ingredientMode="select"
                ingredientOptions={ingredientOptions}
                ingredientSelectLabel={t('dashboard.menuCreateAddIngredient')}
                ingredientPickerClassName="menuCreate__picker"
                selectedIngredients={createIngredients}
                onSelectedIngredientsChange={setCreateIngredients}
                isSubmitting={isCreatingMeal}
                submitLabel={t('dashboard.menuCreateSubmit')}
                disableSubmit={!isCreateValid}
                onSubmit={handleCreateMeal}
                showEmptyCategory
              />
              {!isCreateValid && (
                <div className="menuCreate__errors">
                  {createName.trim() === '' && (
                    <p className="menuError">
                      {t('dashboard.menuCreateMissingName')}
                    </p>
                  )}
                  {createPrice === '' && (
                    <p className="menuError">
                      {t('dashboard.menuAddMissingPrice')}
                    </p>
                  )}
                  {createCategory.trim() === '' && (
                    <p className="menuError">
                      {t('dashboard.menuCreateMissingCategory')}
                    </p>
                  )}
                  {createIngredients.length === 0 && (
                    <p className="menuError">
                      {t('dashboard.menuCreateMissingIngredients')}
                    </p>
                  )}
                  {!createPhoto && (
                    <p className="menuError">
                      {t('dashboard.menuAddMissingPhoto')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default MenuCreateItem
