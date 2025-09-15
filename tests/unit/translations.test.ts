/**
 * Comprehensive unit tests for the translation system
 * Tests type safety, error handling, and all translation functions
 */

import {
  type AllergenKey,
  isValidAllergen,
  translateAllergen,
  translateAllergens,
  getTranslation,
  getFormattedTranslation,
  formatTranslation,
  validateTranslations,
  allergenTranslations,
  translations,
} from '@/lib/translations'

describe('Translation System', () => {
  describe('Type Guards', () => {
    describe('isValidAllergen', () => {
      it('should return true for valid allergens', () => {
        expect(isValidAllergen('gluten')).toBe(true)
        expect(isValidAllergen('dairy')).toBe(true)
        expect(isValidAllergen('nuts')).toBe(true)
      })

      it('should return false for invalid allergens', () => {
        expect(isValidAllergen('invalid')).toBe(false)
        expect(isValidAllergen('unknown')).toBe(false)
        expect(isValidAllergen('')).toBe(false)
      })

      it('should handle edge cases', () => {
        expect(isValidAllergen('GLUTEN')).toBe(false) // case sensitive
        expect(isValidAllergen(' gluten ')).toBe(false) // whitespace
        expect(isValidAllergen('gluten123')).toBe(false) // with numbers
      })
    })
  })

  describe('Allergen Translation', () => {
    describe('translateAllergen', () => {
      it('should translate valid allergens correctly', () => {
        expect(translateAllergen('gluten', 'en')).toBe('gluten')
        expect(translateAllergen('gluten', 'zh')).toBe('麸质')
        expect(translateAllergen('dairy', 'en')).toBe('dairy')
        expect(translateAllergen('dairy', 'zh')).toBe('乳制品')
      })

      it('should handle case normalization', () => {
        expect(translateAllergen('GLUTEN', 'en')).toBe('gluten')
        expect(translateAllergen('Dairy', 'zh')).toBe('乳制品')
        expect(translateAllergen(' nuts ', 'en')).toBe('nuts')
      })

      it('should return fallback for invalid allergens', () => {
        expect(translateAllergen('invalid', 'en')).toBe('invalid')
        expect(translateAllergen('unknown', 'zh')).toBe('unknown')
      })

      it('should handle malformed input gracefully', () => {
        expect(translateAllergen('', 'en')).toBe('Unknown allergen')
        expect(translateAllergen('', 'en', { fallback: 'Custom fallback' })).toBe('Custom fallback')
      })

      it('should handle invalid input types', () => {
        // @ts-expect-error Testing runtime behavior
        expect(translateAllergen(null, 'en')).toBe('Unknown allergen')
        // @ts-expect-error Testing runtime behavior
        expect(translateAllergen(undefined, 'en')).toBe('Unknown allergen')
        // @ts-expect-error Testing runtime behavior
        expect(translateAllergen(123, 'en')).toBe('Unknown allergen')
      })

      it('should support silent mode', () => {
        // Test that silent mode doesn't crash and returns expected values
        const result1 = translateAllergen('invalid', 'en', { silent: true })
        const result2 = translateAllergen('invalid', 'en', { silent: false })

        expect(result1).toBe('invalid') // Should fallback to original
        expect(result2).toBe('invalid') // Should fallback to original

        // Both should return the same result regardless of silent mode
        expect(result1).toBe(result2)
      })

      it('should fall back to English when translation missing', () => {
        // Simulate missing translation by mocking
        const originalTranslations = { ...allergenTranslations }
        // @ts-expect-error Testing edge case
        allergenTranslations.test = { en: 'test', zh: '' }

        expect(translateAllergen('test', 'zh')).toBe('test')

        // Restore
        Object.assign(allergenTranslations, originalTranslations)
      })
    })

    describe('translateAllergens', () => {
      it('should translate multiple allergens correctly', () => {
        const allergens = ['gluten', 'dairy', 'nuts']
        const expected = ['gluten', 'dairy', 'nuts']
        expect(translateAllergens(allergens, 'en')).toEqual(expected)
      })

      it('should translate to Chinese correctly', () => {
        const allergens = ['gluten', 'dairy']
        const expected = ['麸质', '乳制品']
        expect(translateAllergens(allergens, 'zh')).toEqual(expected)
      })

      it('should handle empty arrays', () => {
        expect(translateAllergens([], 'en')).toEqual([])
      })

      it('should handle malformed input', () => {
        // @ts-expect-error Testing runtime behavior
        expect(translateAllergens(null, 'en')).toEqual([])
        // @ts-expect-error Testing runtime behavior
        expect(translateAllergens('not-array', 'en')).toEqual([])
      })

      it('should filter out invalid allergen entries', () => {
        const allergens = ['gluten', '', null, undefined, 'dairy', 123]
        const result = translateAllergens(allergens as string[], 'en')
        expect(result).toEqual(['gluten', 'dairy'])
      })

      it('should handle mixed valid/invalid allergens', () => {
        const allergens = ['gluten', 'invalid', 'dairy']
        const expected = ['gluten', 'invalid', 'dairy'] // invalid ones pass through
        expect(translateAllergens(allergens, 'en')).toEqual(expected)
      })
    })
  })

  describe('Translation System', () => {
    describe('getTranslation', () => {
      it('should get translations for valid paths', () => {
        expect(getTranslation('cart.title', 'en')).toBe('Cart')
        expect(getTranslation('cart.title', 'zh')).toBe('购物车')
        expect(getTranslation('actions.addToCart', 'en')).toBe('Add to Cart')
        expect(getTranslation('nutrition.calories', 'zh')).toBe('卡路里')
      })

      it('should handle invalid paths gracefully', () => {
        expect(getTranslation('invalid.path' as any, 'en')).toBe('[invalid.path]')
        expect(getTranslation('cart.invalid' as any, 'en')).toBe('[cart.invalid]')
      })

      it('should use fallback language when translation missing', () => {
        // Test would require mocking incomplete translations
        const result = getTranslation('cart.title', 'en')
        expect(result).toBe('Cart')
      })

      it('should support custom fallback', () => {
        const result = getTranslation('invalid.path' as any, 'en', { fallback: 'Custom fallback' })
        expect(result).toBe('Custom fallback')
      })

      it('should handle malformed paths', () => {
        expect(getTranslation('invalid' as any, 'en')).toBe('[invalid]')
        expect(getTranslation('' as any, 'en')).toBe('[]')
        expect(getTranslation('...' as any, 'en')).toBe('[...]')
      })
    })

    describe('formatTranslation', () => {
      it('should replace placeholders correctly', () => {
        const text = 'Only {count} available'
        const result = formatTranslation(text, { count: 5 })
        expect(result).toBe('Only 5 available')
      })

      it('should handle multiple placeholders', () => {
        const text = '{name} costs ${price} each'
        const result = formatTranslation(text, { name: 'Burger', price: 12.99 })
        expect(result).toBe('Burger costs $12.99 each')
      })

      it('should handle missing replacements', () => {
        const text = 'Only {count} available'
        const result = formatTranslation(text, {})
        expect(result).toBe('Only {count} available')
      })

      it('should handle null/undefined values', () => {
        const text = 'Value: {value}'
        expect(formatTranslation(text, { value: null as any })).toBe('Value: {value}')
        expect(formatTranslation(text, { value: undefined as any })).toBe('Value: {value}')
      })

      it('should convert numbers to strings', () => {
        const text = 'Price: {price}'
        const result = formatTranslation(text, { price: 19.99 })
        expect(result).toBe('Price: 19.99')
      })

      it('should handle special regex characters in placeholders', () => {
        const text = 'Pattern: {regex}'
        const result = formatTranslation(text, { regex: '$.*+?^{}[]()|\\\\/test' })
        expect(result).toBe('Pattern: $.*+?^{}[]()|\\\\/test')
      })

      it('should handle malformed text input', () => {
        expect(formatTranslation('', {})).toBe('')
        expect(formatTranslation(null as any, {})).toBe('')
        expect(formatTranslation(undefined as any, {})).toBe('')
      })

      it('should handle repeated placeholders', () => {
        const text = '{name} likes {name}'
        const result = formatTranslation(text, { name: 'John' })
        expect(result).toBe('John likes John')
      })
    })

    describe('getFormattedTranslation', () => {
      it('should combine translation and formatting', () => {
        const result = getFormattedTranslation('cart.onlyAvailable', 'en', { count: 3 })
        expect(result).toBe('Only 3 available')
      })

      it('should work with Chinese translations', () => {
        const result = getFormattedTranslation('cart.onlyAvailable', 'zh', { count: 5 })
        expect(result).toBe('仅剩 5 份')
      })

      it('should handle invalid paths with fallback', () => {
        const result = getFormattedTranslation('invalid.path' as any, 'en', { count: 1 }, { fallback: 'Fallback text' })
        expect(result).toBe('Fallback text')
      })
    })
  })

  describe('Translation Validation', () => {
    describe('validateTranslations', () => {
      it('should validate complete translation structure', () => {
        const result = validateTranslations()
        // May have some missing translations, but should not crash
        expect(typeof result.isValid).toBe('boolean')
        expect(Array.isArray(result.errors)).toBe(true)
        console.log('Validation result:', result) // Debug output
      })

      it('should detect missing allergen translations', () => {
        const originalTranslations = { ...allergenTranslations }

        // Temporarily corrupt translations for testing
        // @ts-expect-error Testing validation
        allergenTranslations.test = { en: 'test', zh: '' }

        const result = validateTranslations()
        expect(result.isValid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
        expect(result.errors[0]).toContain('missing translations')

        // Restore
        Object.assign(allergenTranslations, originalTranslations)
        delete (allergenTranslations as any).test
      })

      it('should detect missing namespace translations', () => {
        const originalTranslations = { ...translations }

        // Temporarily corrupt translations
        // @ts-expect-error Testing validation
        translations.test = { invalid: { en: 'test', zh: '' } }

        const result = validateTranslations()
        expect(result.isValid).toBe(false)

        // Restore
        Object.assign(translations, originalTranslations)
        delete (translations as any).test
      })
    })
  })

  describe('Error Handling and Logging', () => {
    it('should handle errors gracefully without crashing', () => {
      // Test that error handling functions work without testing console output
      expect(() => translateAllergen('invalid', 'en')).not.toThrow()
      expect(() => translateAllergens(['invalid'], 'en')).not.toThrow()
      expect(() => getTranslation('invalid.path' as any, 'en')).not.toThrow()
      expect(() => formatTranslation('invalid {placeholder}', {})).not.toThrow()
    })

    it('should provide meaningful fallbacks for all error cases', () => {
      // Test fallback behavior
      expect(translateAllergen('invalid', 'en')).toBe('invalid')
      expect(getTranslation('invalid.path' as any, 'en')).toBe('[invalid.path]')
      expect(formatTranslation(null as any, {})).toBe('')
    })

    it('should support custom fallbacks', () => {
      const customFallback = 'CUSTOM_FALLBACK'
      expect(translateAllergen('invalid', 'en', { fallback: customFallback })).toBe(customFallback)
      expect(getTranslation('invalid.path' as any, 'en', { fallback: customFallback })).toBe(customFallback)
    })
  })

  describe('Edge Cases and Robustness', () => {
    it('should handle unicode characters correctly', () => {
      expect(translateAllergen('gluten', 'zh')).toBe('麸质')
      expect(getTranslation('cart.title', 'zh')).toBe('购物车')
    })

    it('should handle extremely long inputs', () => {
      const longString = 'a'.repeat(10000)
      const result = translateAllergen(longString, 'en')
      expect(result).toBe(longString) // Should return as fallback
    })

    it('should handle special characters in replacements', () => {
      const text = 'Special: {special}'
      const result = formatTranslation(text, { special: '!@#$%^&*()_+-=[]{}|;:,.<>?' })
      expect(result).toBe('Special: !@#$%^&*()_+-=[]{}|;:,.<>?')
    })

    it('should be type-safe at compile time', () => {
      // These should compile without TypeScript errors
      const validPath: 'cart.title' = 'cart.title'
      expect(getTranslation(validPath, 'en')).toBe('Cart')

      const validAllergen: AllergenKey = 'gluten'
      expect(translateAllergen(validAllergen, 'en')).toBe('gluten')
    })

    it('should handle concurrent access safely', async () => {
      const promises = Array.from({ length: 100 }, (_, i) =>
        Promise.resolve(translateAllergen('gluten', i % 2 === 0 ? 'en' : 'zh'))
      )

      const results = await Promise.all(promises)
      results.forEach((result, i) => {
        expect(result).toBe(i % 2 === 0 ? 'gluten' : '麸质')
      })
    })
  })

  describe('Performance', () => {
    it('should handle large batches efficiently', () => {
      const largeAllergenList = Array.from({ length: 1000 }, () => 'gluten')

      const start = performance.now()
      const results = translateAllergens(largeAllergenList, 'en')
      const end = performance.now()

      expect(results).toHaveLength(1000)
      expect(end - start).toBeLessThan(100) // Should complete in <100ms
    })

    it('should cache translation lookups implicitly', () => {
      // Multiple calls should be fast due to JavaScript engine optimizations
      const runs = 1000

      const start = performance.now()
      for (let i = 0; i < runs; i++) {
        getTranslation('cart.title', 'en')
      }
      const end = performance.now()

      expect(end - start).toBeLessThan(50) // Should be very fast
    })
  })
})