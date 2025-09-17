import { Resend } from 'resend'
import { Theme } from 'next-auth'

/**
 * Email service provider configuration for FitBox authentication
 * Supports multiple email providers with fallback mechanisms
 */

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Email verification request parameters
 */
interface VerificationRequest {
  to: string
  url: string
  provider: {
    from: string
    name?: string
  }
  theme?: Theme
}

/**
 * Email template configuration
 */
interface EmailTemplate {
  subject: string
  html: string
  text: string
}

/**
 * Generate email verification templates with bilingual support
 */
function generateVerificationTemplate(
  url: string,
  theme?: Theme,
  locale: 'en' | 'fr' = 'en'
): EmailTemplate {
  const templates = {
    en: {
      subject: 'Sign in to FitBox',
      greeting: 'Welcome to FitBox!',
      message: 'Click the button below to sign in to your account.',
      buttonText: 'Sign In',
      linkText: 'Or copy and paste this URL into your browser:',
      footer: 'If you did not request this email, you can safely ignore it.',
      company: 'FitBox - Asian Fusion Meal Delivery'
    },
    fr: {
      subject: 'Connexion à FitBox',
      greeting: 'Bienvenue chez FitBox!',
      message: 'Cliquez sur le bouton ci-dessous pour vous connecter à votre compte.',
      buttonText: 'Se connecter',
      linkText: 'Ou copiez et collez cette URL dans votre navigateur:',
      footer: 'Si vous n\'avez pas demandé cet e-mail, vous pouvez l\'ignorer en toute sécurité.',
      company: 'FitBox - Livraison de repas fusion asiatique'
    }
  }

  const t = templates[locale]
  const primaryColor = theme?.colorScheme === 'dark' ? '#ffffff' : '#007c89'
  const backgroundColor = theme?.colorScheme === 'dark' ? '#1a1a1a' : '#ffffff'
  const textColor = theme?.colorScheme === 'dark' ? '#ffffff' : '#333333'

  const html = `
<!DOCTYPE html>
<html lang="${locale}" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: ${textColor};
      background-color: ${backgroundColor};
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: ${primaryColor};
    }
    .content {
      padding: 40px 0;
      text-align: center;
    }
    .button {
      display: inline-block;
      background-color: ${primaryColor};
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      margin: 20px 0;
    }
    .link {
      word-break: break-all;
      color: ${primaryColor};
      text-decoration: none;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      border-top: 1px solid #eee;
      font-size: 14px;
      color: #666;
    }
    @media (max-width: 600px) {
      .container {
        padding: 10px;
      }
      .content {
        padding: 20px 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">FitBox</div>
    </div>

    <div class="content">
      <h1>${t.greeting}</h1>
      <p>${t.message}</p>

      <a href="${url}" class="button">${t.buttonText}</a>

      <p style="margin-top: 40px; font-size: 14px; color: #666;">
        ${t.linkText}
      </p>
      <p>
        <a href="${url}" class="link">${url}</a>
      </p>
    </div>

    <div class="footer">
      <p>${t.footer}</p>
      <p><strong>${t.company}</strong></p>
    </div>
  </div>
</body>
</html>`

  const text = `
${t.greeting}

${t.message}

${t.buttonText}: ${url}

${t.linkText}
${url}

${t.footer}

${t.company}
`

  return {
    subject: t.subject,
    html,
    text
  }
}

/**
 * Send verification email using Resend
 */
async function sendWithResend(request: VerificationRequest): Promise<void> {
  const template = generateVerificationTemplate(request.url, request.theme)

  try {
    const result = await resend.emails.send({
      from: request.provider.from,
      to: request.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })

    console.log('Email sent successfully via Resend:', result.data?.id)
  } catch (error) {
    console.error('Failed to send email via Resend:', error)
    throw new Error('Failed to send verification email')
  }
}

/**
 * Fallback email sending using SMTP
 */
async function sendWithSMTP(request: VerificationRequest): Promise<void> {
  try {
    const nodemailer = await import('nodemailer')
    const template = generateVerificationTemplate(request.url, request.theme)

    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    const info = await transporter.sendMail({
      from: request.provider.from,
      to: request.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })

    console.log('Email sent successfully via SMTP:', info.messageId)
  } catch (error) {
    console.error('Failed to send email via SMTP (nodemailer not available):', error)
    throw new Error('Failed to send verification email - SMTP not configured')
  }
}

/**
 * Main email sending function with fallback support
 */
export async function sendVerificationEmail(request: VerificationRequest): Promise<void> {
  // Validate request
  if (!request.to || !request.url) {
    throw new Error('Missing required email parameters')
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(request.to)) {
    throw new Error('Invalid email format')
  }

  // Try Resend first if API key is available
  if (process.env.RESEND_API_KEY) {
    try {
      await sendWithResend(request)
      return
    } catch (error) {
      console.warn('Resend failed, trying SMTP fallback:', error)
    }
  }

  // Fallback to SMTP if configured
  if (process.env.EMAIL_SERVER_HOST) {
    try {
      await sendWithSMTP(request)
      return
    } catch (error) {
      console.error('SMTP fallback also failed:', error)
      throw error
    }
  }

  // No email provider configured
  throw new Error('No email provider configured')
}

/**
 * Email service configuration validation
 */
export function validateEmailConfiguration(): {
  isValid: boolean
  provider: 'resend' | 'smtp' | 'none'
  errors: string[]
} {
  const errors: string[] = []

  // Check for Resend configuration
  if (process.env.RESEND_API_KEY) {
    if (!process.env.EMAIL_FROM) {
      errors.push('EMAIL_FROM is required when using Resend')
    }
    return {
      isValid: errors.length === 0,
      provider: 'resend',
      errors
    }
  }

  // Check for SMTP configuration
  const smtpVars = [
    'EMAIL_SERVER_HOST',
    'EMAIL_SERVER_USER',
    'EMAIL_SERVER_PASSWORD',
    'EMAIL_FROM'
  ]

  const missingSmtpVars = smtpVars.filter(env => !process.env[env])
  if (missingSmtpVars.length === 0) {
    return {
      isValid: true,
      provider: 'smtp',
      errors
    }
  }

  // No provider configured
  if (missingSmtpVars.length < smtpVars.length) {
    errors.push(`SMTP configuration incomplete. Missing: ${missingSmtpVars.join(', ')}`)
  } else {
    errors.push('No email provider configured (Resend or SMTP)')
  }

  return {
    isValid: false,
    provider: 'none',
    errors
  }
}

/**
 * Test email configuration by sending a test email
 */
export async function testEmailConfiguration(testEmail?: string): Promise<{
  success: boolean
  provider: string
  error?: string
}> {
  const validation = validateEmailConfiguration()

  if (!validation.isValid) {
    return {
      success: false,
      provider: validation.provider,
      error: validation.errors.join(', ')
    }
  }

  if (!testEmail) {
    return {
      success: false,
      provider: validation.provider,
      error: 'Test email address is required'
    }
  }

  try {
    await sendVerificationEmail({
      to: testEmail,
      url: 'https://example.com/test',
      provider: {
        from: process.env.EMAIL_FROM!,
        name: 'FitBox Test'
      }
    })

    return {
      success: true,
      provider: validation.provider
    }
  } catch (error) {
    return {
      success: false,
      provider: validation.provider,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Email rate limiting configuration
 */
export class EmailRateLimiter {
  private static attempts = new Map<string, { count: number; lastAttempt: number }>()
  private static readonly MAX_ATTEMPTS = 3
  private static readonly WINDOW_MS = 15 * 60 * 1000 // 15 minutes

  static isRateLimited(email: string): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(email)

    if (!attempts) {
      this.attempts.set(email, { count: 1, lastAttempt: now })
      return false
    }

    // Reset if window has passed
    if (now - attempts.lastAttempt > this.WINDOW_MS) {
      this.attempts.set(email, { count: 1, lastAttempt: now })
      return false
    }

    // Check if over limit
    if (attempts.count >= this.MAX_ATTEMPTS) {
      return true
    }

    // Increment attempts
    attempts.count++
    attempts.lastAttempt = now
    return false
  }

  static getRemainingTime(email: string): number {
    const attempts = this.attempts.get(email)
    if (!attempts || attempts.count < this.MAX_ATTEMPTS) {
      return 0
    }

    const elapsed = Date.now() - attempts.lastAttempt
    return Math.max(0, this.WINDOW_MS - elapsed)
  }

  static reset(email: string): void {
    this.attempts.delete(email)
  }
}