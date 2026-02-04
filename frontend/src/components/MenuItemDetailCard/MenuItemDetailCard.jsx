import MenuItemForm from '../MenuItemForm/MenuItemForm'
import Spinner from '../Spinner/Spinner'

function MenuItemDetailCard({
  t,
  onBack,
  isLoading,
  menuError,
  menuItem,
  updateError,
  formProps,
}) {
  return (
    <section className="card menuCard">
      <div className="menuHeader">
        <div>
          <h2>{t('dashboard.menuDetailTitle')}</h2>
          <p className="muted">{t('dashboard.menuDetailBody')}</p>
        </div>
        <div className="menuActions">
          <button className="btn btn--secondary" type="button" onClick={onBack}>
            {t('dashboard.menuDetailBack')}
          </button>
        </div>
      </div>
      {isLoading && (
        <p className="muted">
          <Spinner className="spinner--inline" label={t('dashboard.menuLoading')} />
        </p>
      )}
      {menuError && <p className="menuError">{menuError}</p>}
      {!isLoading && !menuError && !menuItem && (
        <p className="menuError">{t('dashboard.menuDetailNotFound')}</p>
      )}
      {menuItem && (
        <>
          <MenuItemForm {...formProps} />
          {updateError && <p className="menuError">{updateError}</p>}
        </>
      )}
    </section>
  )
}

export default MenuItemDetailCard
