const STORAGE_KEY = 'fastfood-lang'

export const SUPPORTED_LANGS = ['en', 'it']
export const DEFAULT_LANG = 'it'

export const translations = {
  en: {
    common: {
      brand: 'FastFood',
      goToApp: 'Go to app',
      enterApp: 'Enter the app',
      backToLanding: 'Back to landing',
      back: 'Back',
      userMenu: 'User menu',
      logout: 'Log out',
      logoutSuccess: 'Logged out.',
      logoutError: 'Unable to log out.',
      profileError: 'Unable to load your profile.',
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
      preferences: 'Preferences',
      paymentSelectPlaceholder: 'Select a payment method',
      paymentDelivery: 'On delivery',
      paymentCards: 'Credit cards',
      paymentCoupons: 'Coupons',
      preferencePromo: 'Restaurant with promo',
      preferencePromoHint: 'Highlight restaurants with active promotions.',
      preferenceCheapest: 'Cheapest item',
      preferenceCheapestHint: 'Surface the most affordable menu items first.',
      preferencePopular: 'Most requested product',
      preferencePopularHint: 'Show top ordered products more prominently.',
      restaurateurData: 'Restaurant details',
      restaurantName: 'Restaurant name',
      restaurantPhone: 'Phone',
      vat: 'VAT number',
      restaurantAddress: 'Restaurant address',
      submitCreate: 'Create account',
      submitSignIn: 'Sign in',
      signupToast: 'Signup succeeded. You can log in now.',
      signupError: 'Unable to create the account right now.',
      signinError: 'Unable to sign in right now.',
      signupNote: 'We will create a demo profile to continue.',
      signinNote: 'Demo access for now.',
    },
    dashboard: {
      title: 'Dashboard',
      body: 'You are authenticated. Customer/restaurateur flows will land here.',
      clientTitle: 'Customer dashboard',
      clientBody: 'You are in the customer dashboard area.',
      restaurantTitle: 'Restaurateur dashboard',
      restaurantBody: 'You are in the restaurateur dashboard area.',
      switchToRestaurant: 'Switch to restaurateur',
      switchToClient: 'Switch to customer',
    },
    settings: {
      title: 'User settings',
      subtitle: 'Update your profile details and add extra roles.',
      loading: 'Loading your profile...',
      backToDashboard: 'Back to dashboard',
      roleLegend: 'User type',
      roleHint: 'Existing roles are locked. You can add another one.',
      submit: 'Save changes',
      updateSuccess: 'Profile updated.',
      updateError: 'Unable to update the profile right now.',
    },
  },
  it: {
    common: {
      brand: 'FastFood',
      goToApp: "Vai all'app",
      enterApp: "Entra nell'app",
      backToLanding: 'Torna alla landing',
      back: 'Indietro',
      userMenu: 'Menu utente',
      logout: 'Esci',
      logoutSuccess: 'Logout completato.',
      logoutError: 'Impossibile uscire al momento.',
      profileError: 'Impossibile caricare il profilo.',
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
      preferences: 'Preferenze',
      paymentSelectPlaceholder: 'Seleziona un metodo di pagamento',
      paymentDelivery: 'Alla consegna',
      paymentCards: 'Carte di credito',
      paymentCoupons: 'Coupon',
      preferencePromo: 'Ristorante con promo',
      preferencePromoHint: 'Metti in evidenza i ristoranti con promo attive.',
      preferenceCheapest: 'Prodotto più economico',
      preferenceCheapestHint: 'Mostra per primi gli articoli più convenienti.',
      preferencePopular: 'Prodotto più richiesto',
      preferencePopularHint: 'Evidenzia i prodotti più ordinati.',
      restaurateurData: 'Dati ristoratore',
      restaurantName: 'Nome ristorante',
      restaurantPhone: 'Telefono',
      vat: 'Partita IVA',
      restaurantAddress: 'Indirizzo ristorante',
      submitCreate: 'Crea account',
      submitSignIn: 'Accedi',
      signupToast: 'Registrazione completata. Ora puoi accedere.',
      signupError: "Impossibile creare l'account al momento.",
      signinError: "Impossibile accedere al momento.",
      signupNote: 'Creiamo un profilo demo per continuare.',
      signinNote: 'Accesso demo per ora.',
    },
    dashboard: {
      title: 'Dashboard',
      body: 'Sei autenticato. Qui arriveranno i flussi cliente/ristoratore.',
      clientTitle: 'Dashboard cliente',
      clientBody: "Sei nell'area cliente.",
      restaurantTitle: 'Dashboard ristoratore',
      restaurantBody: "Sei nell'area ristoratore.",
      switchToRestaurant: 'Passa al ristoratore',
      switchToClient: 'Passa al cliente',
    },
    settings: {
      title: 'Impostazioni utente',
      subtitle: 'Aggiorna i dati profilo e aggiungi ruoli extra.',
      loading: 'Caricamento profilo...',
      backToDashboard: 'Torna alla dashboard',
      roleLegend: 'Tipologia di utenza',
      roleHint: 'I ruoli attuali sono bloccati. Puoi aggiungerne uno.',
      submit: 'Salva modifiche',
      updateSuccess: 'Profilo aggiornato.',
      updateError: 'Impossibile aggiornare il profilo al momento.',
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
