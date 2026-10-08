import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080',
})

const getAccess = () => localStorage.getItem('abastix_access')
const getRefresh = () => localStorage.getItem('abastix_refresh')

// Adjunta access token a cada request
api.interceptors.request.use((config) => {
  const token = getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Ante un 401 intenta refrescar una vez y reintenta la request original
let refreshing = null

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const url = original?.url ?? ''

    if (
      status === 401 &&
      !original._retry &&
      !url.includes('/api/auth/login') &&
      !url.includes('/api/auth/refresh')
    ) {
      original._retry = true
      try {
        refreshing =
          refreshing ??
          axios.post('http://localhost:8080/api/auth/refresh', {
            refreshToken: getRefresh(),
          })
        const { data } = await refreshing
        refreshing = null
        localStorage.setItem('abastix_access', data.accessToken)
        localStorage.setItem('abastix_refresh', data.refreshToken)
        localStorage.setItem('abastix_user', JSON.stringify(data.user))
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch (e) {
        refreshing = null
        localStorage.removeItem('abastix_access')
        localStorage.removeItem('abastix_refresh')
        localStorage.removeItem('abastix_user')
        window.location.href = '/login'
        return Promise.reject(e)
      }
    }
    return Promise.reject(error)
  },
)

export default api
