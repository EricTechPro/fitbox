import { z } from 'zod'

export const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().regex(/^\+?1?[0-9]{10}$/, 'Invalid phone number (10 digits required)'),

  streetLine1: z.string().min(5, 'Address must be at least 5 characters'),
  streetLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  province: z.literal('BC', {
    errorMap: () => ({ message: 'Only BC delivery available' })
  }),
  postalCode: z.string().regex(
    /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/,
    'Invalid postal code format (e.g., V6B 1A1)'
  ),

  deliveryDate: z.enum(['sunday', 'wednesday'], {
    errorMap: () => ({ message: 'Please select a delivery date' })
  }),
  deliveryInstructions: z.string().optional(),

  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  }),

  marketingEmails: z.boolean().optional()
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>

// Postal code validation schema
export const postalCodeSchema = z.string().regex(
  /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/,
  'Invalid postal code format (e.g., V6B 1A1)'
)