import type { DeliveryValidation } from '@/types/common'

// Greater Vancouver Area postal code prefixes for delivery
export const validPostalCodes = [
  // Vancouver
  'V5A', 'V5B', 'V5C', 'V5E', 'V5G', 'V5H', 'V5J', 'V5K', 'V5L', 'V5M', 'V5N', 'V5P', 'V5R', 'V5S', 'V5T', 'V5V', 'V5W', 'V5X', 'V5Y', 'V5Z',
  'V6A', 'V6B', 'V6C', 'V6E', 'V6G', 'V6H', 'V6J', 'V6K', 'V6L', 'V6M', 'V6N', 'V6P', 'V6R', 'V6S', 'V6T', 'V6V', 'V6W', 'V6X', 'V6Y', 'V6Z',

  // Burnaby
  'V3J', 'V3N', 'V5A', 'V5B', 'V5C', 'V5E', 'V5G', 'V5H',

  // Richmond
  'V6V', 'V6W', 'V6X', 'V6Y', 'V6Z', 'V7A', 'V7B', 'V7C', 'V7E',

  // North Vancouver
  'V7G', 'V7H', 'V7J', 'V7K', 'V7L', 'V7M', 'V7N', 'V7P', 'V7R',

  // West Vancouver
  'V7S', 'V7T', 'V7V', 'V7W',

  // Coquitlam
  'V3B', 'V3C', 'V3E', 'V3H', 'V3J', 'V3K',

  // Port Coquitlam
  'V3B', 'V3C', 'V3E',

  // New Westminster
  'V3L', 'V3M',

  // Surrey (select areas)
  'V3R', 'V3S', 'V3T', 'V3V', 'V3W', 'V3X', 'V3Y', 'V3Z', 'V4A', 'V4B', 'V4C', 'V4E', 'V4G', 'V4K', 'V4L', 'V4M', 'V4N', 'V4P', 'V4R', 'V4S', 'V4T', 'V4W',

  // Delta (select areas)
  'V4C', 'V4E', 'V4K', 'V4L', 'V4M',

  // Langley (select areas)
  'V1M', 'V2Y', 'V2Z', 'V3A'
]

// Delivery fee calculation based on postal code zones
function calculateDeliveryFee(postalCodePrefix: string): number {
  // ALL GREATER VANCOUVER AREAS - FREE DELIVERY!

  // Core Vancouver areas (FREE)
  const freeDeliveryZones = ['V6B', 'V6C', 'V6E', 'V6G', 'V6H', 'V6J', 'V6K', 'V6L', 'V6M', 'V6N', 'V6P', 'V6R', 'V6S', 'V6T']

  // Richmond and outer Vancouver areas (FREE)
  const richmondVancouverZones = ['V6V', 'V6W', 'V6X', 'V6Y', 'V6Z', 'V7A', 'V7B', 'V7C', 'V7E', 'V5A', 'V5B', 'V5C', 'V5E', 'V5G', 'V5H', 'V5J', 'V5K', 'V5L', 'V5M', 'V5N', 'V5P', 'V5R', 'V5S', 'V5T', 'V5V', 'V5W', 'V5X', 'V5Y', 'V5Z']

  // North Vancouver, West Vancouver, Burnaby, Close Surrey areas (FREE)
  const northWestBurnabyZones = ['V7G', 'V7H', 'V7J', 'V7K', 'V7L', 'V7M', 'V7N', 'V7P', 'V7R', 'V7S', 'V7T', 'V7V', 'V7W', 'V3J', 'V3N', 'V4N', 'V4M', 'V4L', 'V4K']

  // Coquitlam, New Westminster (FREE)
  const coquitlamWestminsterZones = ['V3B', 'V3C', 'V3E', 'V3H', 'V3K', 'V3L', 'V3M']

  // Surrey, Delta (FREE)
  const surreyDeltaZones = ['V3R', 'V3S', 'V3T', 'V3V', 'V3W', 'V3X', 'V3Y', 'V3Z', 'V4A', 'V4B', 'V4C', 'V4E', 'V4G', 'V4P', 'V4R', 'V4S', 'V4T', 'V4W']

  // Langley (DELIVERY FEE)
  const langleyZones = ['V1M', 'V2Y', 'V2Z', 'V3A']

  // All Greater Vancouver areas get FREE DELIVERY (except Langley)!
  if (freeDeliveryZones.includes(postalCodePrefix)) return 0
  if (richmondVancouverZones.includes(postalCodePrefix)) return 0 // FREE
  if (northWestBurnabyZones.includes(postalCodePrefix)) return 0 // FREE
  if (coquitlamWestminsterZones.includes(postalCodePrefix)) return 0 // FREE
  if (surreyDeltaZones.includes(postalCodePrefix)) return 0 // FREE
  if (langleyZones.includes(postalCodePrefix)) return 7.99 // LANGLEY - $7.99 delivery fee

  return 0 // Default to free if not found (shouldn't happen with valid codes)
}

export function validatePostalCode(code: string): DeliveryValidation {
  // Clean and format the postal code
  const formatted = code.replace(/\s+/g, '').toUpperCase()

  // Validate Canadian postal code format
  const canadianPostalCodeRegex = /^[A-Z]\d[A-Z]\d[A-Z]\d$/

  if (!canadianPostalCodeRegex.test(formatted)) {
    return {
      isValid: false,
      deliveryFee: 0,
      message: 'Please enter a valid Canadian postal code (e.g., V6B 1A1)'
    }
  }

  // Extract the first 3 characters for zone checking
  const prefix = formatted.substring(0, 3)

  // Check if it's in our delivery area
  const isInDeliveryArea = validPostalCodes.includes(prefix)

  if (!isInDeliveryArea) {
    return {
      isValid: false,
      deliveryFee: 0,
      message: 'Sorry, we currently only deliver to Greater Vancouver Area. Please check our delivery zones.'
    }
  }

  const deliveryFee = calculateDeliveryFee(prefix)

  return {
    isValid: true,
    deliveryFee,
    message: deliveryFee === 0
      ? 'Great! Free delivery available in your area.'
      : `Delivery available for $${deliveryFee.toFixed(2)}.`
  }
}

export function formatPostalCode(code: string): string {
  // Format as "A1A 1A1"
  const cleaned = code.replace(/\s+/g, '').toUpperCase()
  if (cleaned.length === 6) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`
  }
  return cleaned
}