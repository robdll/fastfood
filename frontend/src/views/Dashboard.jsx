import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import DashboardCard from '../components/DashboardCard/DashboardCard'
import Navbar from '../components/Navbar/Navbar'
import { getMenuByRestaurantId } from '../services/menus'
import { getRestaurants } from '../services/restaurants'
import { getOrders } from '../utils/orders'

const normalizeMenuItems = (menu, restaurant) => {
  const items = menu?.items ?? []
  return items.map((item, index) => {
    const origin =
      item?.origin ??
      item?.meal?.origin ??
      item?.mealOrigin ??
      item?.source ??
      (item?.mealId || item?.meal ? 'catalog' : 'custom')
    const name =
      item?.name ?? item?.title ?? item?.label ?? item?.mealName ?? item?.strMeal ?? '—'
    const price = item?.price ?? item?.cost ?? item?.amount ?? null
    const imageUrl =
      item?.photoUrl ?? item?.photo?.url ?? item?.imageUrl ?? item?.image ?? null
    return {
      id: item?._id ?? item?.mealId ?? `${origin}-${index}`,
      name,
      price,
      origin,
      imageUrl,
      category: item?.category ?? item?.mealCategory ?? null,
      restaurantId: restaurant?._id ?? restaurant?.id ?? null,
      restaurantName: restaurant?.name ?? '',
      raw: item,
    }
  })
}

const findCheapestItem = (items) => {
  const candidates = items.filter((item) => {
    const numeric = Number(item?.price)
    return Number.isFinite(numeric)
  })
  if (candidates.length === 0) return null
  return candidates.reduce((cheapest, current) =>
    Number(current.price) < Number(cheapest.price) ? current : cheapest
  )
}

const findDishOfDay = (menuItems, orders) => {
  const counts = new Map()
  const nameByKey = new Map()
  const itemIdByKey = new Map()

  ;(Array.isArray(orders) ? orders : []).forEach((order) => {
    ;(order?.items ?? []).forEach((item) => {
      const itemId = item?.itemId ?? item?.id ?? null
      const name = item?.name ?? '—'
      const key = itemId ? itemId.toString() : name.toString().toLowerCase()
      const quantity = Number(item?.quantity ?? 1)
      counts.set(key, (counts.get(key) ?? 0) + (Number.isFinite(quantity) ? quantity : 1))
      if (!nameByKey.has(key)) nameByKey.set(key, name)
      if (!itemIdByKey.has(key) && itemId) itemIdByKey.set(key, itemId.toString())
    })
  })

  if (counts.size === 0) return null

  let topKey = null
  let topCount = -1
  counts.forEach((count, key) => {
    if (count > topCount) {
      topCount = count
      topKey = key
    }
  })

  if (!topKey) return null
  const topItemId = itemIdByKey.get(topKey)
  const topName = nameByKey.get(topKey) ?? '—'
  const matched = menuItems.find((item) => {
    if (topItemId && item.id?.toString() === topItemId) return true
    return item.name?.toString().toLowerCase() === topName.toString().toLowerCase()
  })

  return matched ?? { name: topName, imageUrl: null }
}

const pickDailyRestaurant = (restaurants) => {
  if (!Array.isArray(restaurants) || restaurants.length === 0) return null
  const now = new Date()
  const start = Date.UTC(now.getUTCFullYear(), 0, 0)
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const dayOfYear = Math.floor((today - start) / 86400000)
  const index = dayOfYear % restaurants.length
  return restaurants[index]
}

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
  const clientPreferences = Array.isArray(user?.clientData?.preferences)
    ? user.clientData.preferences
    : []
  const showDishOfDay = clientPreferences.includes('popular')
  const showCheapestItem = clientPreferences.includes('cheapest')
  const showPromoRestaurant = clientPreferences.includes('promo')
  const shouldLoadHighlights = showDishOfDay || showCheapestItem || showPromoRestaurant
  const [highlights, setHighlights] = useState({
    dishOfDay: null,
    cheapestItem: null,
    promoRestaurant: null,
    error: null,
    isLoading: false,
  })

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === '') return null
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

  useEffect(() => {
    if (!isClient || !token || !shouldLoadHighlights) return undefined
    let cancelled = false

    const loadHighlights = async () => {
      setHighlights((prev) => ({ ...prev, isLoading: true, error: null }))
      try {
        const restaurants = await getRestaurants(
          token,
          t('clientDashboard.highlightsError')
        )
        if (cancelled) return
        const sortedRestaurants = [...restaurants].sort((a, b) =>
          (a?.name ?? '').localeCompare(b?.name ?? '', lang)
        )
        const promoRestaurant = showPromoRestaurant
          ? pickDailyRestaurant(sortedRestaurants)
          : null

        let menuItems = []
        if (showDishOfDay || showCheapestItem) {
          const menus = await Promise.all(
            sortedRestaurants.map((restaurant) =>
              getMenuByRestaurantId(
                restaurant._id ?? restaurant.id,
                token,
                t('clientDashboard.highlightsError')
              )
            )
          )
          if (cancelled) return
          menuItems = menus.flatMap((menu, index) =>
            normalizeMenuItems(menu, sortedRestaurants[index])
          )
        }

        const cheapestItem = showCheapestItem
          ? findCheapestItem(menuItems)
          : null
        const dishOfDay = showDishOfDay
          ? findDishOfDay(menuItems, getOrders())
          : null

        if (!cancelled) {
          setHighlights({
            dishOfDay,
            cheapestItem,
            promoRestaurant,
            error: null,
            isLoading: false,
          })
        }
      } catch (error) {
        if (cancelled) return
        setHighlights((prev) => ({
          ...prev,
          error: error?.message ?? t('clientDashboard.highlightsError'),
          isLoading: false,
        }))
      }
    }

    loadHighlights()
    return () => {
      cancelled = true
    }
  }, [
    isClient,
    token,
    shouldLoadHighlights,
    showDishOfDay,
    showCheapestItem,
    showPromoRestaurant,
    lang,
    t,
  ])

  const title = isClient
    ? t('dashboard.clientTitle')
    : t('dashboard.restaurantTitle')
  const switchLabel = isClient
    ? t('dashboard.switchToRestaurant')
    : t('dashboard.switchToClient')
  const badgeItems = useMemo(() => {
    if (!isClient) return []
    const items = []
    if (showDishOfDay) {
      items.push({
        key: 'dish',
        type: 'icon',
        iconLabel: 'D',
        iconUrl: highlights.dishOfDay?.imageUrl ?? null,
        title: t('clientDashboard.dishTitle'),
        body: highlights.dishOfDay
          ? t('clientDashboard.dishBody', { name: highlights.dishOfDay.name })
          : t('clientDashboard.highlightEmpty'),
      })
    }
    if (showCheapestItem) {
      items.push({
        key: 'cheapest',
        type: 'icon',
        iconLabel: '$',
        iconUrl: highlights.cheapestItem?.imageUrl ?? null,
        title: t('clientDashboard.cheapestTitle'),
        body: highlights.cheapestItem
          ? t('clientDashboard.cheapestBody', {
              name: highlights.cheapestItem.name,
              price: formatPrice(highlights.cheapestItem.price) ?? '—',
            })
          : t('clientDashboard.highlightEmpty'),
      })
    }
    if (showPromoRestaurant) {
      const promoId =
        highlights.promoRestaurant?._id ?? highlights.promoRestaurant?.id ?? null
      items.push({
        key: 'promo',
        type: 'promo',
        title: t('clientDashboard.promoTitle'),
        body: highlights.promoRestaurant?.name ?? '—',
        actionLabel: t('clientDashboard.promoAction'),
        actionTo: promoId ? `/dashboard/client/restaurants/${promoId}` : '',
      })
    }
    return items
  }, [
    formatPrice,
    highlights.cheapestItem,
    highlights.dishOfDay,
    highlights.promoRestaurant,
    isClient,
    showCheapestItem,
    showDishOfDay,
    showPromoRestaurant,
    t,
  ])

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
          {isClient && badgeItems.length > 0 && (
            <section className="dashboardBadges">
              {badgeItems.map((badge) => (
                <article
                  key={badge.key}
                  className={`card dashboardBadge${
                    badge.type === 'promo' ? ' dashboardBadge--promo' : ''
                  }`}
                >
                  {badge.type === 'promo' ? (
                    <>
                      <p className="dashboardBadge__title">{badge.title}</p>
                      <p className="dashboardBadge__body">{badge.body}</p>
                      {badge.actionLabel && badge.actionTo && (
                        <Link className="dashboardBadge__link" to={badge.actionTo}>
                          {badge.actionLabel}
                        </Link>
                      )}
                    </>
                  ) : (
                    <div className="dashboardBadge__row">
                      <span className="dashboardBadge__icon" aria-hidden="true">
                        {badge.iconUrl ? (
                          <img src={badge.iconUrl} alt="" loading="lazy" />
                        ) : (
                          badge.iconLabel
                        )}
                      </span>
                      <div className="dashboardBadge__content">
                        <p className="dashboardBadge__title">{badge.title}</p>
                        <p className="dashboardBadge__body">{badge.body}</p>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </section>
          )}
          {isClient && (
            <section className="grid dashboardCards">
              <DashboardCard
                title={t('clientDashboard.searchTitle')}
                body={t('clientDashboard.searchBody')}
                actionLabel={t('clientDashboard.searchAction')}
                actionTo="/dashboard/client/restaurants"
                actionVariant="btn--secondary"
              />
              <DashboardCard
                title={t('clientDashboard.ordersTitle')}
                body={t('clientDashboard.ordersBody')}
                actionLabel={t('clientDashboard.ordersAction')}
                actionTo="/dashboard/client/orders"
                actionVariant="btn--sky"
              />
              <DashboardCard
                title={t('clientDashboard.cartTitle')}
                body={t('clientDashboard.cartBody')}
                actionLabel={t('clientDashboard.cartAction')}
                actionTo="/dashboard/client/cart"
                actionVariant="btn--primary"
              />
            </section>
          )}
          {!isClient && (
            <section className="grid dashboardCards">
              <DashboardCard
                title={t('dashboard.menuTitle')}
                body={t('dashboard.menuBody')}
                actionLabel={t('dashboard.menuAction')}
                actionTo="/dashboard/restaurant/menu"
                actionVariant="btn--secondary"
              />
              <DashboardCard
                title={t('dashboard.ordersTitle')}
                body={t('dashboard.ordersBody')}
                actionLabel={t('dashboard.ordersAction')}
                actionTo="/dashboard/restaurant/orders"
                actionVariant="btn--sky"
              />
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
