'use client'
import { useAppStore } from '@/store/appStore'
import { translations } from '@/lib/i18n'

export function useTranslation() {
  const language = useAppStore((s) => s.language)
  const dict = translations[language]
  return {
    t: dict,
    language,
    isRTL: language === 'ar',
  }
}
