import { SUPPORTED_LANGS } from '../../i18n'
import './LanguageSelector.css'

function LanguageSelector({ lang, onChange, t }) {
  return (
    <div className="langToggle">
      <span className="langToggle__label">{t('common.language')}</span>
      <div className="segmented" role="group" aria-label={t('common.language')}>
        {SUPPORTED_LANGS.map((option) => (
          <button
            key={option}
            type="button"
            className={`segmented__btn ${lang === option ? 'is-active' : ''}`}
            aria-pressed={lang === option}
            onClick={() => onChange(option)}
          >
            {option.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}

export default LanguageSelector
