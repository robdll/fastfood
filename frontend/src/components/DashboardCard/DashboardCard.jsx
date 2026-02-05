import { Link } from 'react-router-dom'
import './DashboardCard.css'

function DashboardCard({
  title,
  body,
  actionLabel,
  actionTo,
  actionVariant,
  mediaUrl,
  mediaAlt,
}) {
  return (
    <article className="card">
      {mediaUrl && (
        <div className="dashboardCard__media">
          <img src={mediaUrl} alt={mediaAlt ?? title} loading="lazy" />
        </div>
      )}
      <h2>{title}</h2>
      {body && <p className="muted">{body}</p>}
      {actionLabel && actionTo && (
        <div className="dashboardCard__actions">
          <Link className={`btn ${actionVariant}`} to={actionTo}>
            {actionLabel}
          </Link>
        </div>
      )}
    </article>
  )
}

export default DashboardCard
