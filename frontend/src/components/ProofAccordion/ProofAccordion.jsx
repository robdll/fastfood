import { useState } from 'react'
import './ProofAccordion.css'

function ProofAccordion({
  title,
  body,
  items,
  emptyText,
  placeholderText,
  gifAltPrefix,
}) {
  const [openIndex, setOpenIndex] = useState(0)
  const hasItems = Array.isArray(items) && items.length > 0
  const hasHeader = Boolean(title || body)

  const handleToggle = (index) => {
    setOpenIndex((current) => (current === index ? null : index))
  }

  return (
    <div className="proofs">
      {hasHeader ? (
        <header className="proofs__header">
          {title ? <h2>{title}</h2> : null}
          {body ? <p className="muted proofs__body">{body}</p> : null}
        </header>
      ) : null}

      {!hasItems ? (
        <p className="muted">{emptyText}</p>
      ) : (
        <div className="proofs__list">
          {items.map((item, index) => {
            const isOpen = index === openIndex
            const panelId = `proof-panel-${index}`
            const buttonId = `proof-toggle-${index}`

            return (
              <article className="proofs__item" key={item.title ?? index}>
                <button
                  type="button"
                  className="proofs__toggle"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  id={buttonId}
                  onClick={() => handleToggle(index)}
                >
                  <span className="proofs__title">{item.title}</span>
                  <span className="proofs__icon" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                <div
                  className={`proofs__panel ${isOpen ? 'is-open' : ''}`}
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                >
                  <p className="muted proofs__description">{item.description}</p>
                  {item.gif ? (
                    <img
                      className="proofs__gif"
                      src={item.gif}
                      alt={`${gifAltPrefix} ${item.title}`}
                      loading="lazy"
                    />
                  ) : (
                    <div className="proofs__placeholder">{placeholderText}</div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ProofAccordion
