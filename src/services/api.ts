import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const BASE = import.meta.env.VITE_API_URL ?? ''

export const api = axios.create({
  baseURL: `${BASE}/api/v1`,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (
      error.response?.status === 403 &&
      error.response?.data?.detail?.code === 'PASSWORD_CHANGE_REQUIRED' &&
      window.location.pathname !== '/change-password'
    ) {
      window.location.href = '/change-password'
      return Promise.reject(error)
    }
    if (error.response?.status !== 401 || original._retry || original.url?.startsWith('/auth/')) {
      return Promise.reject(error)
    }
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
        .catch(Promise.reject)
    }
    original._retry = true
    isRefreshing = true
    try {
      const res = await axios.post(
        `${BASE}/api/v1/auth/refresh`,
        {},
        { withCredentials: true }
      )
      const { access_token, user } = res.data
      useAuthStore.getState().setAuth(access_token, user)
      processQueue(null, access_token)
      original.headers.Authorization = `Bearer ${access_token}`
      return api(original)
    } catch (refreshError) {
      processQueue(refreshError, null)
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
