import './LandingCard.css'

function LandingCard({ id, title, body, items, className = '' }) {
  const hasItems = Array.isArray(items) && items.length > 0

  return (
    <section className={`card landingCard ${className}`.trim()} aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {body ? <p className="muted">{body}</p> : null}
      {hasItems ? (
        <ul className="muted">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

export default LandingCard
