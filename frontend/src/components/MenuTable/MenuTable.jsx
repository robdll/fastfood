import './MenuTable.css'

function MenuTable({
  items,
  isLoading,
  emptyLabel,
  formatPrice,
  getOriginLabel,
  onRowClick,
  onDelete,
  deleteLabel,
  isDeleting,
  deletingId,
  t,
}) {
  const showActions = Boolean(onDelete)
  const totalColumns = showActions ? 6 : 5

  return (
    <div
      className={`menuTableWrapper${
        isLoading ? ' menuTableWrapper--loading' : ''
      }`}
    >
      <table className="menuTable">
        {!isLoading && (
          <thead>
            <tr>
              <th>{t('dashboard.menuTableImage')}</th>
              <th>{t('dashboard.menuTableName')}</th>
              <th>{t('dashboard.menuTableType')}</th>
              <th>{t('dashboard.menuTablePrice')}</th>
              <th>{t('dashboard.menuTableOrigin')}</th>
              {showActions && <th>{t('dashboard.menuTableActions')}</th>}
            </tr>
          </thead>
        )}
        <tbody>
          {!isLoading && items.length === 0 ? (
            <tr>
              <td className="menuEmpty" colSpan={totalColumns}>
                {emptyLabel}
              </td>
            </tr>
          ) : (
            items.map((item) => (
                <tr
                  key={item.id}
                  className="menuRow"
                  onClick={() => onRowClick?.(item)}
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
                  <td>{item.category ?? '—'}</td>
                  <td>{formatPrice(item.price)}</td>
                  <td>{getOriginLabel(item.origin)}</td>
                  {showActions && (
                    <td className="menuTable__actions">
                      <button
                        className="menuTable__actionBtn"
                        type="button"
                        aria-label={deleteLabel}
                        disabled={isDeleting}
                        onClick={(event) => {
                          event.stopPropagation()
                          onDelete?.(item)
                        }}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M6 6l12 12M18 6L6 18"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </td>
                  )}
                </tr>
              ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default MenuTable
