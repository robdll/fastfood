import { Link } from 'react-router-dom'
import './DashboardCard.css'

function DashboardCard({ title, body, actionLabel, actionTo, actionVariant }) {
  return (
    <article className="card">
      <h2>{title}</h2>
      <p className="muted">{body}</p>
      <div className="dashboardCard__actions">
        <Link className={`btn ${actionVariant}`} to={actionTo}>
          {actionLabel}
        </Link>
      </div>
    </article>
  )
}

export default DashboardCard
