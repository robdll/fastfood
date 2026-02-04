import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import Modal from '../components/Modal/Modal'
import MenuTable from '../components/MenuTable/MenuTable'
import Navbar from '../components/Navbar/Navbar'
import Spinner from '../components/Spinner/Spinner'
import useToast from '../hooks/useToast'
import { deleteMenuItem, getMenuByRestaurantId } from '../services/menus'

function RestaurantMenu({
  user,
  token,
  onLogout,
  canSwitch,
  switchPath,
  lang,
  onLangChange,
  t,
}) {
  const restaurantId = user?._id ?? null
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [menu, setMenu] = useState(null)
  const [menuError, setMenuError] = useState(null)
  const [isMenuLoading, setIsMenuLoading] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeletingItem, setIsDeletingItem] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

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
        item?.meal?.origin ??
        item?.mealOrigin ??
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
        raw: item,
      }
    })
  }, [menu])

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

  const handleDeleteRequest = (item) => {
    if (isDeletingItem) return
    setPendingDelete(item)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!pendingDelete || !restaurantId || !token) return
    setIsDeletingItem(true)
    try {
      const updated = await deleteMenuItem(
        restaurantId,
        pendingDelete.mealId ?? pendingDelete.id,
        token,
        t('dashboard.menuDeleteError')
      )
      setMenu(updated)
      setIsDeleteOpen(false)
      setPendingDelete(null)
      showToast({ type: 'success', message: t('dashboard.menuDeleteSuccess') })
    } catch (error) {
      const message = error?.message ?? t('dashboard.menuDeleteError')
      showToast({ type: 'error', message })
    } finally {
      setIsDeletingItem(false)
    }
  }

  const handleDeleteCancel = () => {
    if (isDeletingItem) return
    setIsDeleteOpen(false)
    setPendingDelete(null)
  }

  return (
    <div className="landing dashboard">
      <Navbar t={t} lang={lang} onLangChange={onLangChange} />
      <Breadcrumbs
        t={t}
        backTo="/dashboard/restaurant"
        items={[
          { label: t('dashboard.restaurantTitle'), to: '/dashboard/restaurant' },
          { label: t('dashboard.menuTitle') },
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
                <h2>{t('dashboard.menuTitle')}</h2>
                <p className="muted">{t('dashboard.menuBody')}</p>
              </div>
              <div className="menuActions">
                <button
                  className="btn btn--secondary"
                  type="button"
                  onClick={() => navigate('/dashboard/restaurant/menu/add')}
                >
                  {t('dashboard.menuAddButton')}
                </button>
              </div>
            </div>
            {isMenuLoading && (
              <p className="muted">
                <Spinner
                  className="spinner--inline"
                  label={t('dashboard.menuLoading')}
                />
              </p>
            )}
            {menuError && <p className="menuError">{menuError}</p>}
            <MenuTable
              items={menuItems}
              isLoading={isMenuLoading}
              emptyLabel={t('dashboard.menuEmpty')}
              formatPrice={formatPrice}
              getOriginLabel={getOriginLabel}
              onRowClick={(item) =>
                navigate(`/dashboard/restaurant/menu/${item.mealId ?? item.id}`)
              }
              onDelete={handleDeleteRequest}
              deleteLabel={t('dashboard.menuDeleteAction')}
              isDeleting={isDeletingItem}
              deletingId={pendingDelete?.id ?? pendingDelete?.mealId ?? null}
              t={t}
            />
          </section>
        </div>
      </main>
      <Modal
        isOpen={isDeleteOpen}
        title={t('dashboard.menuDeleteTitle')}
        description={t('dashboard.menuDeleteDescription')}
        submitLabel={t('dashboard.menuDeleteConfirm')}
        cancelLabel={t('dashboard.menuDeleteCancel')}
        submitVariant="danger"
        onSubmit={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  )
}

export default RestaurantMenu
