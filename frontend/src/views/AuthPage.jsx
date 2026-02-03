import { Link } from 'react-router-dom'
import AuthForm from '../components/AuthForm/AuthForm'
import Navbar from '../components/Navbar/Navbar'

function AuthPage({ onAuthSuccess, lang, onLangChange, t }) {
  return (
    <div className="landing auth">
      <Navbar t={t} lang={lang} onLangChange={onLangChange}>
        <Link className="navLink" to="/">
          {t('common.backToLanding')}
        </Link>
      </Navbar>

      <main>
        <div className="page">
          <AuthForm
            t={t}
            onSubmit={() => {
              onAuthSuccess()
            }}
          />
        </div>
      </main>
    </div>
  )
}

export default AuthPage
