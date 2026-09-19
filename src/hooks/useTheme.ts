import { useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

const THEME_KEY = 'merito-pgn-theme:v1'

const readTheme = (): Theme => {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

// Mantiene el tema elegido, lo aplica al documento y lo recuerda en este
// dispositivo. El estado vive aqui porque nadie mas lo escribe.
export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(readTheme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#101a1f' : '#f5f8fb')
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* preferencia no disponible */
    }
  }, [theme])
  return [theme, setTheme]
}
