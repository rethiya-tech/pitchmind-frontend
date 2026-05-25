import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

function applyThemeToDom(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => {
        applyThemeToDom(theme)
        set({ theme })
      },
      toggleTheme: () => {
        const next: Theme = get().theme === 'light' ? 'dark' : 'light'
        applyThemeToDom(next)
        set({ theme: next })
      },
    }),
    {
      name: 'pm-theme',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyThemeToDom(state.theme)
      },
    },
  ),
)

export function initThemeFromStorage() {
  if (typeof window === 'undefined') return
  const stored = localStorage.getItem('pm-theme')
  let theme: Theme = 'light'
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      theme = parsed?.state?.theme === 'dark' ? 'dark' : 'light'
    } catch {
      // fall through to default
    }
  }
  applyThemeToDom(theme)
}
