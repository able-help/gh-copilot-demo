import { computed, ref } from 'vue'
import type { ThemeName } from '../theme'
import { de } from './locales/de'
import { en } from './locales/en'
import { fr } from './locales/fr'

const messages = {
  en,
  fr,
  de
}

export type Locale = keyof typeof messages
type MessageKey = Exclude<keyof typeof en, 'languages' | 'monthsShort' | 'themes'>
type MessageParams = {
  count?: number
}

const intlLocales: Record<Locale, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  de: 'de-DE'
}

const storageKey = 'album-viewer-locale'

function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'en'
  }

  const storedLocale = window.localStorage.getItem(storageKey)
  if (storedLocale === 'en' || storedLocale === 'fr' || storedLocale === 'de') {
    return storedLocale
  }

  return 'en'
}

const localeRef = ref<Locale>(detectInitialLocale())

export const locale = computed({
  get: () => localeRef.value,
  set: (value: Locale) => {
    localeRef.value = value
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, value)
    }
  }
})

export const availableLocales: Locale[] = ['en', 'fr', 'de']

export function t(key: MessageKey, params?: MessageParams): string {
  const message = messages[localeRef.value][key]

  if (typeof message !== 'string') {
    return ''
  }

  return message.replace(/\{count\}/g, String(params?.count ?? 0))
}

export function languageLabelFor(value: Locale): string {
  return messages[localeRef.value].languages[value]
}

export function themeLabelFor(value: ThemeName): string {
  return messages[localeRef.value].themes[value]
}

export function monthLabels(): readonly string[] {
  return messages[localeRef.value].monthsShort
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(intlLocales[localeRef.value], {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

export function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) {
    return value
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  return new Intl.DateTimeFormat(intlLocales[localeRef.value], {
    dateStyle: 'medium'
  }).format(new Date(year, month - 1, day))
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(intlLocales[localeRef.value], {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}