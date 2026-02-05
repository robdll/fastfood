import AuthForm from '../components/AuthForm/AuthForm'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import Navbar from '../components/Navbar/Navbar'

function AuthPage({ onAuthSuccess, lang, onLangChange, t }) {
  return (
    <div className="landing auth">
      <Navbar t={t} lang={lang} onLangChange={onLangChange} />
      <Breadcrumbs
        t={t}
        backTo="/"
        items={[{ label: t('auth.title') }]}
      />

      <main>
        <div className="page">
          <AuthForm
            t={t}
            lang={lang}
            onSubmit={(authResponse) => {
              onAuthSuccess(authResponse)
            }}
          />
        </div>
      </main>
    </div>
  )
}

export default AuthPage
