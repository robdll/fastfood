const STORAGE_KEY = 'fastfood-lang'

export const SUPPORTED_LANGS = ['en', 'it']
export const DEFAULT_LANG = 'it'

export const translations = {
  en: {
    common: {
      brand: 'FastFood',
      goToApp: 'Go to app',
      enterApp: 'Enter the app',
      backToLanding: '← Back to landing',
      logout: 'Log out',
      language: 'Language',
      languageChanged: 'Language updated.',
    },
    health: {
      title: 'API health',
      description: 'Quick sanity check that the frontend can reach the backend.',
      loading: 'Loading…',
    },
    landing: {
      heroTitleLine1: 'Online ordering',
      heroTitleLine2: 'for fast-food restaurants.',
      heroSubtitle:
        'FastFood is a web app that supports the full ordering flow: customers browse a restaurant menu, build a cart, place orders and track status updates; restaurateurs manage menu items and process incoming orders.',
      bullets: [
        'Simple, bold UI with a neobrutalist style.',
        'Backend-first data model exposed via REST APIs.',
        'Clear separation between structure (React) and styling (CSS).',
      ],
      previewLabel: 'Project preview',
      sectionLabel: 'Status and info',
      whatsNextTitle: "What's next",
      whatsNextBody:
        'This is just the landing. The “real app” area is currently a stub so you can already navigate via the CTA.',
      whatsNextList: [
        'Auth (customer / restaurateur)',
        'Menu + cart + order status',
        'Restaurant management and deliveries',
      ],
    },
    footer: {
      copyright: 'Copyright reserved. Student Roberto Di Lillo, Mat. 908918',
    },
    appStub: {
      title: 'App area (stub)',
      body:
        'This route exists so the landing CTA has somewhere real to go. We’ll replace this with the actual app screens later.',
    },
    auth: {
      title: 'Account access',
      subtitle: 'Register as a customer, restaurateur, or both.',
      modeLabel: 'Auth mode',
      signIn: 'Sign in',
      signUp: 'Sign up',
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      password: 'Password',
      roleLegend: 'User type',
      roleClient: 'Customer',
      roleRestaurant: 'Restaurateur',
      roleHint: 'Select at least one type.',
      clientData: 'Customer details',
      paymentMethod: 'Payment method',
      paymentPlaceholder: 'Credit or prepaid card',
      preferences: 'Preferences',
      preferencesPlaceholder: 'E.g. special offers, favorite food type',
      restaurateurData: 'Restaurant details',
      restaurantName: 'Restaurant name',
      restaurantPhone: 'Phone',
      vat: 'VAT number',
      restaurantAddress: 'Restaurant address',
      submitCreate: 'Create account',
      submitSignIn: 'Sign in',
      signupToast: 'Signup succeeded. You can log in now.',
      signupError: 'Unable to create the account right now.',
      signupNote: 'We will create a demo profile to continue.',
      signinNote: 'Demo access for now.',
    },
    dashboard: {
      title: 'Dashboard',
      body: 'You are authenticated. Customer/restaurateur flows will land here.',
    },
  },
  it: {
    common: {
      brand: 'FastFood',
      goToApp: "Vai all'app",
      enterApp: "Entra nell'app",
      backToLanding: '← Torna alla landing',
      logout: 'Esci',
      language: 'Lingua',
      languageChanged: 'Lingua aggiornata.',
    },
    health: {
      title: 'Stato API',
      description:
        'Controllo rapido per verificare che il frontend raggiunga il backend.',
      loading: 'Caricamento…',
    },
    landing: {
      heroTitleLine1: 'Ordini online',
      heroTitleLine2: 'per ristoranti fast-food.',
      heroSubtitle:
        'FastFood è una web app che supporta tutto il flusso d’ordine: i clienti sfogliano il menu, creano un carrello, effettuano ordini e seguono lo stato; i ristoratori gestiscono i piatti e processano gli ordini in arrivo.',
      bullets: [
        'UI semplice e decisa con stile neobrutalist.',
        'Modello dati backend-first esposto via API REST.',
        'Separazione chiara tra struttura (React) e stile (CSS).',
      ],
      previewLabel: 'Anteprima progetto',
      sectionLabel: 'Stato e info',
      whatsNextTitle: 'Cosa c’è dopo',
      whatsNextBody:
        "Questa è solo la landing. L’area “app vera” è una bozza, così puoi già navigare dalla CTA.",
      whatsNextList: [
        'Auth (cliente / ristoratore)',
        'Menu + carrello + stato ordine',
        'Gestione ristoranti e consegne',
      ],
    },
    footer: {
      copyright: 'Copyright reserved. Student Roberto Di Lillo, Mat. 908918',
    },
    appStub: {
      title: 'Area app (bozza)',
      body:
        'Questa route esiste così la CTA della landing ha una destinazione reale. La sostituiremo con le schermate definitive.',
    },
    auth: {
      title: 'Accesso account',
      subtitle: 'Registrati come cliente, ristoratore, oppure entrambi.',
      modeLabel: 'Modalità accesso',
      signIn: 'Accedi',
      signUp: 'Registrati',
      firstName: 'Nome',
      lastName: 'Cognome',
      email: 'Email',
      password: 'Password',
      roleLegend: 'Tipologia di utenza',
      roleClient: 'Cliente',
      roleRestaurant: 'Ristoratore',
      roleHint: 'Seleziona almeno una tipologia.',
      clientData: 'Dati cliente',
      paymentMethod: 'Metodo di pagamento',
      paymentPlaceholder: 'Carta di credito o prepagata',
      preferences: 'Preferenze',
      preferencesPlaceholder: 'Es. offerte speciali, tipologia preferita',
      restaurateurData: 'Dati ristoratore',
      restaurantName: 'Nome ristorante',
      restaurantPhone: 'Telefono',
      vat: 'Partita IVA',
      restaurantAddress: 'Indirizzo ristorante',
      submitCreate: 'Crea account',
      submitSignIn: 'Accedi',
      signupToast: 'Registrazione completata. Ora puoi accedere.',
      signupError: "Impossibile creare l'account al momento.",
      signupNote: 'Creiamo un profilo demo per continuare.',
      signinNote: 'Accesso demo per ora.',
    },
    dashboard: {
      title: 'Dashboard',
      body: 'Sei autenticato. Qui arriveranno i flussi cliente/ristoratore.',
    },
  },
}

export const normalizeLang = (value, fallback = DEFAULT_LANG) => {
  if (!value) return fallback
  const lower = value.toLowerCase()
  const match = SUPPORTED_LANGS.find(
    (lang) => lower === lang || lower.startsWith(`${lang}-`)
  )
  return match ?? fallback
}

export const getInitialLang = () => {
  if (typeof window === 'undefined') return DEFAULT_LANG
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored) return normalizeLang(stored)
  return normalizeLang(window.navigator?.language)
}

export const setStoredLang = (lang) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, lang)
}

const resolveKey = (source, key) =>
  key.split('.').reduce((acc, part) => acc?.[part], source)

export const createT = (lang) => {
  const langSource = translations[lang] ?? translations[DEFAULT_LANG]

  return (key, vars) => {
    const value = resolveKey(langSource, key)
    const fallback = resolveKey(translations[DEFAULT_LANG], key)
    const resolved = value ?? fallback ?? key

    if (typeof resolved !== 'string') return resolved
    if (!vars) return resolved
    return resolved.replace(/\{(\w+)\}/g, (match, token) =>
      Object.prototype.hasOwnProperty.call(vars, token) ? vars[token] : match
    )
  }
}
