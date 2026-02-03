import Navbar from '../components/Navbar/Navbar'

function Dashboard({ onLogout, lang, onLangChange, t }) {
  return (
    <div className="landing dashboard">
      <Navbar t={t} lang={lang} onLangChange={onLangChange}>
        <button
          className="navLink navLink--button"
          type="button"
          onClick={onLogout}
        >
          {t('common.logout')}
        </button>
      </Navbar>
      <main>
        <div className="page">
          <section className="card">
            <h2>{t('dashboard.title')}</h2>
            <p className="muted">{t('dashboard.body')}</p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
