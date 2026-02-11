import Footer from '../components/Footer/Footer'
import HealthCard from '../components/HealthCard/HealthCard'
import HeroSection from '../components/HeroSection/HeroSection'
import LandingCard from '../components/LandingCard/LandingCard'
import Navbar from '../components/Navbar/Navbar'
import ProofAccordion from '../components/ProofAccordion/ProofAccordion'

function Landing({ health, error, onEnterApp, lang, onLangChange, t }) {
  const whatsNextList = t('landing.whatsNextList')
  const proofsList = t('landing.proofsList')
  const proofsTitle = t('landing.proofsTitle')
  const proofsBody = t('landing.proofsBody')

  return (
    <div className="landing">
      <Navbar t={t} lang={lang} onLangChange={onLangChange} />

      <main>
        <HeroSection t={t} onEnterApp={onEnterApp} />

        <section
          id="api-health"
          className="landingSection landingSection--compact section"
          aria-label={t('landing.sectionLabel')}
        >
          <div className="page">
            <h2 className="landingSection__title">
              {t('landing.sectionLabel')}
            </h2>
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

        <section
          id="proofs"
          className="landingSection landingSection--proofs section"
          aria-label={proofsTitle}
        >
          <h2 className="landingSection__title landingSection__title--light">
            {proofsTitle}
          </h2>
          <p className="landingSection__subtitle">{proofsBody}</p>
          <ProofAccordion
            items={Array.isArray(proofsList) ? proofsList : []}
            emptyText={t('landing.proofsEmpty')}
            placeholderText={t('landing.proofsPlaceholder')}
            gifAltPrefix={t('landing.proofsGifAlt')}
          />
        </section>
      </main>

      <Footer text={t('footer.copyright')} />
    </div>
  )
}

export default Landing
