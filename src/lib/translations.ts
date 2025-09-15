// Translation utilities for the FitBox app with comprehensive type safety and error handling

export type Language = 'en' | 'zh'

// Translation configuration
const TRANSLATION_CONFIG = {
  enableConsoleWarnings: process.env.NODE_ENV === 'development',
  fallbackLanguage: 'en' as Language,
} as const

// Type definitions for better type safety
export interface TranslationValue {
  en: string
  zh: string
}

export interface TranslationReplacements {
  [key: string]: string | number
}

// Define valid allergen keys as a const assertion for type safety
const VALID_ALLERGENS = [
  'gluten', 'dairy', 'eggs', 'egg', 'fish', 'shellfish',
  'nuts', 'peanuts', 'soy', 'sesame', 'sulfites', 'mustard'
] as const

export type AllergenKey = typeof VALID_ALLERGENS[number]

// Type guard to check if a string is a valid allergen
export function isValidAllergen(value: string): value is AllergenKey {
  return VALID_ALLERGENS.includes(value as AllergenKey)
}

// Allergen translations with strict typing
export const allergenTranslations: Record<AllergenKey, TranslationValue> = {
  gluten: { en: 'gluten', zh: '麸质' },
  dairy: { en: 'dairy', zh: '乳制品' },
  eggs: { en: 'eggs', zh: '鸡蛋' },
  egg: { en: 'egg', zh: '鸡蛋' },
  fish: { en: 'fish', zh: '鱼类' },
  shellfish: { en: 'shellfish', zh: '贝类' },
  nuts: { en: 'nuts', zh: '坚果' },
  peanuts: { en: 'peanuts', zh: '花生' },
  soy: { en: 'soy', zh: '大豆' },
  sesame: { en: 'sesame', zh: '芝麻' },
  sulfites: { en: 'sulfites', zh: '亚硫酸盐' },
  mustard: { en: 'mustard', zh: '芥末' }
} as const

// Translation namespace organization
export const translations = {
  cart: {
    title: { en: 'Cart', zh: '购物车' },
    itemsInCart: { en: 'items in your cart', zh: '项商品 在您的购物车中' },
    each: { en: 'each', zh: '每份' },
    onlyAvailable: { en: 'Only {count} available', zh: '仅剩 {count} 份' },
    onlyLeft: { en: 'Only {count} left!', zh: '仅剩 {count} 份!' },
    remove: { en: 'Remove item', zh: '移除商品' },
  },
  menu: {
    allMeals: { en: 'All Meals', zh: '所有餐点' },
    riceBased: { en: 'Rice-Based', zh: '米饭类' },
    noodleSoups: { en: 'Noodle Soups', zh: '面条汤类' },
    pastaFusion: { en: 'Pasta Fusion', zh: '意面融合' },
    proteinSides: { en: 'Protein & Sides', zh: '蛋白质配菜' },
  },
  actions: {
    addToCart: { en: 'Add to Cart', zh: '加入购物车' },
    details: { en: 'Details', zh: '详情' },
    featured: { en: 'Featured', zh: '推荐' },
    outOfStock: { en: 'Out of Stock', zh: '缺货' },
    increase: { en: 'Increase quantity', zh: '增加数量' },
    decrease: { en: 'Decrease quantity', zh: '减少数量' },
  },
  nutrition: {
    calories: { en: 'Calories', zh: '卡路里' },
    protein: { en: 'Protein', zh: '蛋白质' },
    carbs: { en: 'Carbs', zh: '碳水化合物' },
    fat: { en: 'Fat', zh: '脂肪' },
    ingredients: { en: 'Ingredients', zh: '成分' },
    allergens: { en: 'Allergens', zh: '过敏原' },
    nutritionalInfo: { en: 'Nutritional Information', zh: '营养信息' },
  },
} as const

// Type helpers for translation paths
export type TranslationNamespace = keyof typeof translations
export type TranslationKey<T extends TranslationNamespace> = keyof typeof translations[T]
export type TranslationPath = {
  [K in TranslationNamespace]: `${K}.${string & TranslationKey<K>}`
}[TranslationNamespace]

// Error handling utility
function logTranslationWarning(message: string, context?: Record<string, unknown>): void {
  if (TRANSLATION_CONFIG.enableConsoleWarnings) {
    // eslint-disable-next-line no-console
    console.warn(`[Translation Warning]: ${message}`, context || '')
  }
}

// Safe allergen translation with comprehensive error handling
export function translateAllergen(
  allergen: string,
  language: Language,
  options: { fallback?: string; silent?: boolean } = {}
): string {
  if (!allergen || typeof allergen !== 'string') {
    const fallback = options.fallback || 'Unknown allergen'
    if (!options.silent) {
      logTranslationWarning('Invalid allergen input', { allergen, type: typeof allergen })
    }
    return fallback
  }

  const normalizedAllergen = allergen.toLowerCase().trim() as AllergenKey

  if (!isValidAllergen(normalizedAllergen)) {
    const fallback = options.fallback || allergen
    if (!options.silent) {
      logTranslationWarning('Allergen not found in translations', {
        allergen: normalizedAllergen,
        available: VALID_ALLERGENS
      })
    }
    return fallback
  }

  const translation = allergenTranslations[normalizedAllergen]
  if (!translation || !translation[language]) {
    const fallback = options.fallback || translation?.[TRANSLATION_CONFIG.fallbackLanguage] || allergen
    if (!options.silent) {
      logTranslationWarning('Translation missing for language', {
        allergen: normalizedAllergen,
        language,
        available: Object.keys(translation || {})
      })
    }
    return fallback
  }

  return translation[language]
}

// Safe multiple allergen translation
export function translateAllergens(
  allergens: string[],
  language: Language,
  options: { silent?: boolean } = {}
): string[] {
  if (!Array.isArray(allergens)) {
    if (!options.silent) {
      logTranslationWarning('Expected array for allergens', { allergens, type: typeof allergens })
    }
    return []
  }

  return allergens
    .filter(allergen => allergen && typeof allergen === 'string')
    .map(allergen => translateAllergen(allergen, language, { silent: options.silent }))
}

// Safe nested translation getter
export function getTranslation(
  path: TranslationPath,
  language: Language,
  options: { fallback?: string; silent?: boolean } = {}
): string {
  try {
    const [namespace, key] = path.split('.') as [TranslationNamespace, string]

    if (!namespace || !key) {
      throw new Error('Invalid translation path format')
    }

    const namespaceTranslations = translations[namespace]
    if (!namespaceTranslations) {
      throw new Error(`Namespace '${namespace}' not found`)
    }

    const translation = namespaceTranslations[key as keyof typeof namespaceTranslations] as TranslationValue | undefined
    if (!translation) {
      throw new Error(`Translation key '${key}' not found in namespace '${namespace}'`)
    }

    const value = translation[language]
    if (!value) {
      const fallbackValue = translation[TRANSLATION_CONFIG.fallbackLanguage]
      if (!options.silent) {
        logTranslationWarning('Translation missing for language, using fallback', {
          path,
          language,
          fallbackLanguage: TRANSLATION_CONFIG.fallbackLanguage
        })
      }
      return fallbackValue || options.fallback || `[${path}]`
    }

    return value
  } catch (error) {
    const fallback = options.fallback || `[${path}]`
    if (!options.silent) {
      logTranslationWarning('Translation lookup failed', {
        path,
        language,
        error: error instanceof Error ? error.message : String(error)
      })
    }
    return fallback
  }
}

// Legacy UI translation getter (backward compatibility)
export function getUITranslation(key: string, language: Language): string {
  // Map old keys to new namespace structure
  const keyMap: Record<string, TranslationPath> = {
    cart: 'cart.title',
    itemsInCart: 'cart.itemsInCart',
    each: 'cart.each',
    onlyAvailable: 'cart.onlyAvailable',
    allMeals: 'menu.allMeals',
    riceBased: 'menu.riceBased',
    noodleSoups: 'menu.noodleSoups',
    pastaFusion: 'menu.pastaFusion',
    proteinSides: 'menu.proteinSides',
    addToCart: 'actions.addToCart',
    details: 'actions.details',
    featured: 'actions.featured',
    outOfStock: 'actions.outOfStock',
    calories: 'nutrition.calories',
    protein: 'nutrition.protein',
    carbs: 'nutrition.carbs',
    fat: 'nutrition.fat',
    ingredients: 'nutrition.ingredients',
    allergens: 'nutrition.allergens',
    nutritionalInfo: 'nutrition.nutritionalInfo',
  }

  const mappedPath = keyMap[key]
  if (mappedPath) {
    return getTranslation(mappedPath, language, { silent: true })
  }

  logTranslationWarning('Legacy translation key not found', { key, availableKeys: Object.keys(keyMap) })
  return `[${key}]`
}

// Safe text formatting with placeholder replacement
export function formatTranslation(
  text: string,
  replacements: TranslationReplacements = {},
  options: { silent?: boolean } = {}
): string {
  if (!text || typeof text !== 'string') {
    if (!options.silent) {
      logTranslationWarning('Invalid text for formatting', { text, type: typeof text })
    }
    return String(text || '')
  }

  try {
    let result = text
    Object.entries(replacements).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        const placeholder = `{${key}}`
        const replacement = String(value)
        result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), replacement)
      }
    })
    return result
  } catch (error) {
    if (!options.silent) {
      logTranslationWarning('Text formatting failed', {
        text,
        replacements,
        error: error instanceof Error ? error.message : String(error)
      })
    }
    return text
  }
}

// Utility function to get formatted translation
export function getFormattedTranslation(
  path: TranslationPath,
  language: Language,
  replacements: TranslationReplacements = {},
  options: { fallback?: string; silent?: boolean } = {}
): string {
  const text = getTranslation(path, language, options)
  return formatTranslation(text, replacements, options)
}

// Type-safe translation validation (useful for tests)
export function validateTranslations(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate allergen translations completeness
  Object.entries(allergenTranslations).forEach(([key, value]) => {
    if (!value.en || !value.zh) {
      errors.push(`Allergen '${key}' missing translations: ${JSON.stringify(value)}`)
    }
  })

  // Validate main translations completeness
  function validateNamespace(obj: Record<string, unknown>, path: string = ''): void {
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key
      if (value && typeof value === 'object' && 'en' in value && 'zh' in value) {
        if (!value.en || !value.zh) {
          errors.push(`Translation '${currentPath}' missing languages: ${JSON.stringify(value)}`)
        }
      } else if (value && typeof value === 'object') {
        validateNamespace(value, currentPath)
      }
    })
  }

  validateNamespace(translations)

  return {
    isValid: errors.length === 0,
    errors
  }
}