import { Link } from 'react-router-dom'
import './Breadcrumbs.css'

const UserIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    focusable="false"
  >
    <path
      d="M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z"
      fill="currentColor"
    />
  </svg>
)

function Breadcrumbs({ items = [], backTo, t, userMenu }) {
  if (!items.length) return null

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <div className="breadcrumbs__inner container">
        <div className="breadcrumbs__left">
          {backTo && (
            <Link
              className="breadcrumbs__back"
              to={backTo}
              aria-label={t ? t('common.back') : 'Back'}
            >
              <span aria-hidden="true">←</span>
            </Link>
          )}
          <ol className="breadcrumbs__list">
            {items.map((item, index) => {
              const isLast = index === items.length - 1
              const content = item.to ? (
                <Link className="breadcrumbs__link" to={item.to}>
                  {item.label}
                </Link>
              ) : (
                <span className="breadcrumbs__current">{item.label}</span>
              )

              return (
                <li key={`${item.label}-${index}`} className="breadcrumbs__item">
                  {content}
                  {!isLast && <span className="breadcrumbs__sep">›</span>}
                </li>
              )
            })}
          </ol>
        </div>
        {userMenu && (
          <div className="breadcrumbs__actions">
            <div className="breadcrumbs__user">
              <button
                className="breadcrumbs__userTrigger"
                type="button"
                aria-haspopup="true"
                aria-label={t ? t('common.userMenu') : 'User menu'}
              >
                <UserIcon />
              </button>
              <div className="breadcrumbs__menu" role="menu">
                {userMenu.showSwitch && userMenu.switchPath && (
                  <Link className="breadcrumbs__menuItem" to={userMenu.switchPath}>
                    {userMenu.switchLabel}
                  </Link>
                )}
                <Link className="breadcrumbs__menuItem" to={userMenu.settingsPath}>
                  {t ? t('settings.title') : 'User settings'}
                </Link>
                <button
                  className="breadcrumbs__menuItem breadcrumbs__menuButton"
                  type="button"
                  onClick={userMenu.onLogout}
                >
                  {t ? t('common.logout') : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Breadcrumbs
