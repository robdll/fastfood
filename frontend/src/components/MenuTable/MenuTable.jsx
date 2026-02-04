import './MenuTable.css'

function MenuTable({
  items,
  isLoading,
  emptyLabel,
  formatPrice,
  getOriginLabel,
  onRowClick,
  t,
}) {
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
            </tr>
          </thead>
        )}
        <tbody>
          {!isLoading && items.length === 0 ? (
            <tr>
              <td className="menuEmpty" colSpan={5}>
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
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default MenuTable
