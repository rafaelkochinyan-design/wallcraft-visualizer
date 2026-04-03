import { useTranslation } from 'react-i18next'
import { LocalizedString } from '../types'

export function useLocalized() {
  const { i18n } = useTranslation()

  return (obj: LocalizedString | null | undefined, fallback = ''): string => {
    if (!obj) return fallback
    const lang = i18n.language as keyof LocalizedString
    return obj[lang] || obj.ru || obj.en || fallback
  }
}
