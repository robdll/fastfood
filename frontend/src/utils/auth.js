const TOKEN_KEY = 'jwt'

const getJwt = () => window.localStorage.getItem(TOKEN_KEY)
const setJwt = (token) => window.localStorage.setItem(TOKEN_KEY, token)
const clearJwt = () => window.localStorage.removeItem(TOKEN_KEY)

export { TOKEN_KEY, getJwt, setJwt, clearJwt }
