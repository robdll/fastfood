import LanguageSelector from '../LanguageSelector/LanguageSelector'
import './Navbar.css'

function Navbar({ t, lang, onLangChange, children, showLanguage = true }) {
  return (
    <header className="navbar">
      <div className="navInner">
        <div className="topbar">
          <div className="brand" aria-label={t('common.brand')}>
            <img
              className="brand__mark"
              src="/images/hero-cutout.png"
              alt=""
              aria-hidden="true"
            />
            <span className="brand__text">{t('common.brand')}</span>
          </div>
          <div className="topbar__actions">
            {children}
            {showLanguage && (
              <LanguageSelector
                lang={lang}
                onChange={onLangChange}
                t={t}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
