import { computed, ref } from 'vue'

export type ThemeName = 'default' | 'dark'

const storageKey = 'album-viewer-theme'

function isThemeName(value: string | null): value is ThemeName {
  return value === 'default' || value === 'dark'
}

function detectInitialTheme(): ThemeName {
  if (typeof window === 'undefined') {
    return 'default'
  }

  const storedTheme = window.localStorage.getItem(storageKey)

  if (isThemeName(storedTheme)) {
    return storedTheme
  }

  return 'default'
}

function applyTheme(value: ThemeName): void {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.dataset.theme = value
  document.documentElement.style.colorScheme = value === 'dark' ? 'dark' : 'light'
}

const themeRef = ref<ThemeName>(detectInitialTheme())

export const availableThemes: ThemeName[] = ['default', 'dark']

export const theme = computed({
  get: () => themeRef.value,
  set: (value: ThemeName) => {
    themeRef.value = value
    applyTheme(value)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, value)
    }
  }
})

export function initializeTheme(): void {
  applyTheme(themeRef.value)
}