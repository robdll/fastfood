import './HeroSection.css'

function HeroSection({ t, onEnterApp }) {
  const heroBullets = t('landing.bullets')

  return (
    <section className="heroFull" aria-labelledby="hero-title">
      <div className="heroInner">
        <div className="container">
          <div className="hero">
            <div>
              <h1 className="hero__title" id="hero-title">
                {t('landing.heroTitleLine1')}
                <br />
                {t('landing.heroTitleLine2')}
              </h1>
              <p className="hero__subtitle">{t('landing.heroSubtitle')}</p>

              <ul className="hero__bullets">
                {(Array.isArray(heroBullets) ? heroBullets : []).map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>

              <div className="hero__actions">
                <button
                  className="btn btn--secondary"
                  type="button"
                  onClick={onEnterApp}
                >
                  {t('common.enterApp')}
                </button>
              </div>
            </div>

            <div
              className="hero__illus"
              role="img"
              aria-label={t('landing.previewLabel')}
            >
              <img src="/images/hero-cutout.png" alt="" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
