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
  // Authentication namespace
  auth: {
    // Header translations
    welcomeBack: { en: 'Welcome Back', zh: '欢迎回来' },
    signInToAccount: { en: 'Sign in to your account', zh: '登录您的账户' },
    welcomeToFitbox: { en: 'Welcome to FitBox', zh: '欢迎来到 FitBox' },
    createAccount: { en: 'Create your account', zh: '创建您的账户' },
    signInWith: { en: 'Sign in with Email', zh: '邮箱登录' },

    // Form field labels
    email: { en: 'Email', zh: '邮箱' },
    password: { en: 'Password', zh: '密码' },
    firstName: { en: 'First Name', zh: '名字' },
    lastName: { en: 'Last Name', zh: '姓氏' },
    phone: { en: 'Phone Number', zh: '电话号码' },
    confirmPassword: { en: 'Confirm Password', zh: '确认密码' },

    // Placeholder text
    emailPlaceholder: { en: 'your@email.com', zh: 'your@email.com' },
    passwordPlaceholder: { en: 'Enter your password', zh: '输入您的密码' },
    firstNamePlaceholder: { en: 'John', zh: '张' },
    lastNamePlaceholder: { en: 'Doe', zh: '三' },
    phonePlaceholder: { en: '+1 (555) 123-4567', zh: '+1 (555) 123-4567' },

    // Button text
    signIn: { en: 'Sign In', zh: '登录' },
    signUp: { en: 'Sign Up', zh: '注册' },
    signOut: { en: 'Sign Out', zh: '退出登录' },
    forgotPassword: { en: 'Forgot your password?', zh: '忘记密码？' },
    resetPassword: { en: 'Reset Password', zh: '重置密码' },
    sendMagicLink: { en: 'Send Magic Link', zh: '发送魔法链接' },

    // Alternative actions
    orContinueWith: { en: 'Or continue with', zh: '或者继续使用' },
    alreadyHaveAccount: { en: 'Already have an account?', zh: '已有账户？' },
    hasAccount: { en: 'Already have an account?', zh: '已有账户？' },
    noAccount: { en: "Don't have an account?", zh: '还没有账户？' },
    backToSignIn: { en: 'Back to sign in', zh: '返回登录' },

    // Status messages
    loading: { en: 'Loading...', zh: '加载中...' },
    signingIn: { en: 'Signing in...', zh: '登录中...' },
    signingUp: { en: 'Creating account...', zh: '创建账户中...' },
    sendingEmail: { en: 'Sending email...', zh: '发送邮件中...' },

    // Error messages
    invalidCredentials: { en: 'Invalid email or password', zh: '邮箱或密码错误' },
    passwordMismatch: { en: 'Passwords do not match', zh: '密码不匹配' },
    emailRequired: { en: 'Email is required', zh: '邮箱为必填项' },
    passwordRequired: { en: 'Password is required', zh: '密码为必填项' },
    emailInvalid: { en: 'Please enter a valid email', zh: '请输入有效的邮箱地址' },
    passwordTooShort: { en: 'Password must be at least 8 characters', zh: '密码至少需要8个字符' },
    firstNameRequired: { en: 'First name is required', zh: '名字为必填项' },
    lastNameRequired: { en: 'Last name is required', zh: '姓氏为必填项' },

    // Success messages
    accountCreated: { en: 'Account created successfully', zh: '账户创建成功' },
    passwordReset: { en: 'Password reset successfully', zh: '密码重置成功' },
    emailSent: { en: 'Email sent successfully', zh: '邮件发送成功' },
    signInSuccess: { en: 'Signed in successfully', zh: '登录成功' },

    // Email verification
    checkEmail: { en: 'Check your email', zh: '查看您的邮箱' },
    emailSentMessage: { en: 'We sent you a sign-in link. Be sure to check your spam folder.', zh: '我们已向您发送了登录链接。请确保查看您的垃圾邮件文件夹。' },
    linkExpired: { en: 'Link expired or invalid', zh: '链接已过期或无效' },
    resendEmail: { en: 'Resend email', zh: '重新发送邮件' },

    // OAuth providers
    continueWithGoogle: { en: 'Continue with Google', zh: '使用 Google 继续' },
    continueWithGithub: { en: 'Continue with GitHub', zh: '使用 GitHub 继续' },
    continueWithEmail: { en: 'Continue with Email', zh: '使用邮箱继续' },
    signInWithEmailLink: { en: 'Sign in with Email Link', zh: '使用邮箱链接登录' },
  },

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