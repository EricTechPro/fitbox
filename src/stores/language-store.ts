import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Language } from '@/types/common'

interface LanguageStore {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: 'en',

      setLanguage: (lang) => {
        set({ language: lang })
      },

      toggleLanguage: () => {
        const { language } = get()
        set({ language: language === 'en' ? 'zh' : 'en' })
      }
    }),
    {
      name: 'fitbox-language-preference'
    }
  )
)