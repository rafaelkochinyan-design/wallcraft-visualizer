import { useTranslation } from 'react-i18next'
import { LocalizedString } from '../types'

export function useLocalized() {
  const { i18n } = useTranslation()

  return (obj: LocalizedString | null | undefined, fallback = ''): string => {
    if (!obj) return fallback
    // i18n.language may return full locale like "en-US" — take just first 2 chars
    const lang = i18n.language.slice(0, 2) as keyof LocalizedString
    return obj[lang] || obj.en || obj.ru || obj.am || fallback
  }
}
