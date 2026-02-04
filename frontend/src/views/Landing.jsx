import Footer from '../components/Footer/Footer'
import HealthCard from '../components/HealthCard/HealthCard'
import HeroSection from '../components/HeroSection/HeroSection'
import LandingCard from '../components/LandingCard/LandingCard'
import Navbar from '../components/Navbar/Navbar'

function Landing({ health, error, onEnterApp, lang, onLangChange, t }) {
  const whatsNextList = t('landing.whatsNextList')

  return (
    <div className="landing">
      <Navbar t={t} lang={lang} onLangChange={onLangChange} />

      <main>
        <HeroSection t={t} onEnterApp={onEnterApp} />

        <section
          id="api-health"
          className="landingSection section"
          aria-label={t('landing.sectionLabel')}
        >
          <div className="page">
            <div className="grid">
              <HealthCard health={health} error={error} t={t} />

              <LandingCard
                id="what-next-title"
                title={t('landing.whatsNextTitle')}
                body={t('landing.whatsNextBody')}
                items={Array.isArray(whatsNextList) ? whatsNextList : []}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer text={t('footer.copyright')} />
    </div>
  )
}

export default Landing
