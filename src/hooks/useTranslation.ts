'use client'

import { useCallback, useMemo } from 'react'
import { useLanguageStore } from '@/stores/language-store'
import {
  type TranslationPath,
  type TranslationReplacements,
  getTranslation,
  getFormattedTranslation,
  translateAllergen,
  translateAllergens,
} from '@/lib/translations'

/**
 * Custom hook for accessing translations with the current language context
 * Provides a convenient interface for components to access translations
 */
export function useTranslation() {
  const { language } = useLanguageStore()

  // Memoized translation function with current language
  const t = useCallback(
    (path: TranslationPath, options?: { fallback?: string; silent?: boolean }) => {
      return getTranslation(path, language, options)
    },
    [language]
  )

  // Memoized formatted translation function
  const tf = useCallback(
    (
      path: TranslationPath,
      replacements: TranslationReplacements = {},
      options?: { fallback?: string; silent?: boolean }
    ) => {
      return getFormattedTranslation(path, language, replacements, options)
    },
    [language]
  )

  // Memoized allergen translation functions
  const allergen = useCallback(
    (allergenName: string, options?: { fallback?: string; silent?: boolean }) => {
      return translateAllergen(allergenName, language, options)
    },
    [language]
  )

  const allergens = useCallback(
    (allergenNames: string[], options?: { silent?: boolean }) => {
      return translateAllergens(allergenNames, language, options)
    },
    [language]
  )

  // Memoized language info
  const languageInfo = useMemo(
    () => ({
      current: language,
      isEnglish: language === 'en',
      isChinese: language === 'zh',
    }),
    [language]
  )

  return {
    /** Current language */
    language,
    /** Language information helpers */
    lang: languageInfo,
    /** Get translation by path */
    t,
    /** Get formatted translation with replacements */
    tf,
    /** Translate single allergen */
    allergen,
    /** Translate multiple allergens */
    allergens,
  }
}

/**
 * Hook specifically for allergen translations
 * Simplified interface for components that only need allergen translations
 */
export function useAllergenTranslation() {
  const { language } = useLanguageStore()

  const translateSingle = useCallback(
    (allergenName: string, options?: { fallback?: string; silent?: boolean }) => {
      return translateAllergen(allergenName, language, options)
    },
    [language]
  )

  const translateMultiple = useCallback(
    (allergenNames: string[], options?: { silent?: boolean }) => {
      return translateAllergens(allergenNames, language, options)
    },
    [language]
  )

  return {
    language,
    translate: translateSingle,
    translateAll: translateMultiple,
  }
}

/**
 * Hook for formatted translations with common replacement patterns
 * Provides shortcuts for common formatting scenarios
 */
export function useFormattedTranslation() {
  const { language } = useLanguageStore()

  const count = useCallback(
    (path: TranslationPath, count: number, options?: { fallback?: string; silent?: boolean }) => {
      return getFormattedTranslation(path, language, { count }, options)
    },
    [language]
  )

  const price = useCallback(
    (path: TranslationPath, price: number, options?: { fallback?: string; silent?: boolean }) => {
      return getFormattedTranslation(path, language, { price: price.toFixed(2) }, options)
    },
    [language]
  )

  const name = useCallback(
    (path: TranslationPath, name: string, options?: { fallback?: string; silent?: boolean }) => {
      return getFormattedTranslation(path, language, { name }, options)
    },
    [language]
  )

  const custom = useCallback(
    (
      path: TranslationPath,
      replacements: TranslationReplacements,
      options?: { fallback?: string; silent?: boolean }
    ) => {
      return getFormattedTranslation(path, language, replacements, options)
    },
    [language]
  )

  return {
    language,
    /** Format with count replacement */
    count,
    /** Format with price replacement (auto-formatted to 2 decimals) */
    price,
    /** Format with name replacement */
    name,
    /** Format with custom replacements */
    custom,
  }
}

/**
 * Type-safe helper for creating translation paths
 * Helps prevent typos in translation paths at compile time
 */
export const translationPaths = {
  cart: {
    title: 'cart.title' as const,
    itemsInCart: 'cart.itemsInCart' as const,
    each: 'cart.each' as const,
    onlyAvailable: 'cart.onlyAvailable' as const,
    onlyLeft: 'cart.onlyLeft' as const,
    remove: 'cart.remove' as const,
  },
  menu: {
    allMeals: 'menu.allMeals' as const,
    riceBased: 'menu.riceBased' as const,
    noodleSoups: 'menu.noodleSoups' as const,
    pastaFusion: 'menu.pastaFusion' as const,
    proteinSides: 'menu.proteinSides' as const,
  },
  actions: {
    addToCart: 'actions.addToCart' as const,
    details: 'actions.details' as const,
    featured: 'actions.featured' as const,
    outOfStock: 'actions.outOfStock' as const,
    increase: 'actions.increase' as const,
    decrease: 'actions.decrease' as const,
  },
  nutrition: {
    calories: 'nutrition.calories' as const,
    protein: 'nutrition.protein' as const,
    carbs: 'nutrition.carbs' as const,
    fat: 'nutrition.fat' as const,
    ingredients: 'nutrition.ingredients' as const,
    allergens: 'nutrition.allergens' as const,
    nutritionalInfo: 'nutrition.nutritionalInfo' as const,
  },
} as const

/**
 * Export type for external use
 */
export type TranslationPaths = typeof translationPaths