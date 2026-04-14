'use client'
import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'

export function LangEffect() {
  const language = useAppStore((s) => s.language)

  useEffect(() => {
    const html = document.documentElement
    html.lang = language
    html.dir = language === 'ar' ? 'rtl' : 'ltr'
    if (language === 'ar') {
      html.classList.add('lang-ar')
    } else {
      html.classList.remove('lang-ar')
    }
  }, [language])

  return null
}
