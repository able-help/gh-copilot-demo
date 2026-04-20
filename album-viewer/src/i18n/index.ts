import { ref, computed } from 'vue'
import en from './locales/en'
import fr from './locales/fr'
import de from './locales/de'

type Locale = 'en' | 'fr' | 'de'
type Messages = typeof en

const locales: Record<Locale, Messages> = { en, fr, de }

const currentLocale = ref<Locale>('en')

export function useI18n() {
  const locale = currentLocale

  const setLocale = (l: Locale) => {
    currentLocale.value = l
  }

  const t = computed(() => (key: keyof Messages, params?: Record<string, string | number>) => {
    let msg: string = locales[currentLocale.value][key] ?? locales.en[key] ?? key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        msg = msg.replace(`{${k}}`, String(v))
      }
    }
    return msg
  })

  return { locale, setLocale, t }
}
