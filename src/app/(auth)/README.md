# FitBox Authentication System

## Overview

Complete authentication implementation for the FitBox meal delivery app using NextAuth.js v4 with App Router support.

## Features

✅ **Email/Password Authentication**
- Secure credential-based login with bcrypt hashing
- Password strength validation (8+ chars, mixed case, numbers)
- Beta limitation: 10 new users per week

✅ **Magic Link Authentication**
- Passwordless login via email verification
- 24-hour expiration for security
- Email rate limiting (3 attempts per 15 minutes)

✅ **Bilingual Support**
- English and Chinese translations
- All auth pages and error messages
- RTL-friendly responsive design

✅ **Security Features**
- CSRF protection via NextAuth.js
- Secure HTTP-only cookies
- Session management with JWT strategy
- SQL injection prevention with Prisma ORM
- Rate limiting on authentication endpoints

✅ **Mobile-First Design**
- Responsive forms with shadcn/ui components
- Touch-friendly interfaces
- Optimized for mobile screens

## Authentication Flows

### 1. User Registration (`/auth/register`)
```
1. User fills registration form
2. Server validates input and checks beta limits
3. Password hashed with bcryptjs (12 rounds)
4. User created in database
5. Automatic sign-in after registration
6. Redirect to callback URL
```

### 2. Email/Password Sign-In (`/auth/login`)
```
1. User enters credentials
2. Server validates against database
3. JWT token generated with user data
4. Session created with 30-day expiration
5. Redirect to callback URL
```

### 3. Magic Link Sign-In (`/auth/login` → Email option)
```
1. User enters email address
2. Server generates verification token
3. Email sent with sign-in link
4. User clicks link to authenticate
5. Token validated and session created
```

## API Endpoints

### NextAuth.js Routes (`/api/auth/[...nextauth]`)
- `GET/POST /api/auth/signin` - Sign in forms and processing
- `GET/POST /api/auth/signout` - Sign out processing
- `GET /api/auth/session` - Current session data
- `GET /api/auth/csrf` - CSRF token
- `GET /api/auth/providers` - Available auth providers
- `GET /api/auth/callback/[provider]` - OAuth callbacks

### Custom Routes
- `POST /api/auth/signup` - User registration endpoint

## Database Schema

### Required Tables
```sql
-- NextAuth.js required tables
Account (OAuth providers)
Session (user sessions)
VerificationToken (email verification)

-- Application tables
User (extended with FitBox fields)
```

### User Model Extensions
```prisma
model User {
  // Standard NextAuth fields
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?

  // FitBox application fields
  password      String?   // Optional for OAuth users
  firstName     String?
  lastName      String?
  phone         String?
  role          UserRole  @default(CUSTOMER)

  // Relations
  accounts      Account[]
  sessions      Session[]
  addresses     Address[]
  orders        Order[]
}
```

## Environment Variables

### Required Variables
```env
# NextAuth.js configuration
NEXTAUTH_SECRET="32-character-minimum-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/fitbox"
DATABASE_URL_TEST="postgresql://user:pass@localhost:5432/fitbox_test"
```

### Email Configuration (Choose One)
```env
# Option 1: Resend (recommended)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@fitbox.com"

# Option 2: SMTP Server (fallback)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_SERVER_SECURE="false"
```

## File Structure

```
src/
├── app/
│   ├── (auth)/                    # Auth pages group
│   │   ├── login/page.tsx         # Sign in page
│   │   ├── register/page.tsx      # Registration page
│   │   ├── error/page.tsx         # Auth error handling
│   │   └── verify-request/page.tsx # Email verification
│   └── api/auth/
│       ├── [...nextauth]/route.ts # NextAuth handler
│       └── signup/route.ts        # Registration API
├── components/auth/
│   └── auth-form.tsx              # Reusable auth form
├── lib/
│   ├── auth.ts                    # NextAuth configuration
│   ├── auth-config.ts             # Provider configuration
│   ├── email-provider.ts          # Email service setup
│   └── translations.ts            # Auth translations
└── hooks/
    └── useTranslation.ts          # Translation hook
```

## Usage Examples

### Client-Side Authentication
```tsx
'use client'
import { useSession, signIn, signOut } from 'next-auth/react'

export function AuthButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <p>Loading...</p>

  if (session) {
    return (
      <>
        <p>Signed in as {session.user.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }

  return (
    <>
      <p>Not signed in</p>
      <button onClick={() => signIn()}>Sign in</button>
    </>
  )
}
```

### Server-Side Authentication
```tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div>
      <h1>Welcome {session.user.firstName}!</h1>
      <p>Email: {session.user.email}</p>
      <p>Role: {session.user.role}</p>
    </div>
  )
}
```

### API Route Protection
```tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    message: 'Hello authenticated user!',
    user: session.user
  })
}
```

## Error Handling

### Authentication Errors
- `CredentialsSignin` - Invalid email/password
- `SessionRequired` - Session expired
- `AccessDenied` - User not authorized
- `Verification` - Invalid verification link
- `Configuration` - Server configuration error

### Custom Error Pages
- `/auth/error` - Centralized error handling
- Context-aware error messages
- User-friendly recovery actions
- Support contact information

## Testing

### Contract Tests
```bash
npm run test:api  # Run auth API contract tests
```

### E2E Testing
```bash
npm run test:e2e  # Run auth flow tests
```

### Manual Testing Checklist
- [ ] User registration with valid data
- [ ] Registration beta limit enforcement
- [ ] Email/password sign-in
- [ ] Magic link sign-in
- [ ] Invalid credential handling
- [ ] Email rate limiting
- [ ] Session persistence
- [ ] Sign-out functionality
- [ ] Mobile responsiveness
- [ ] Language switching

## Security Considerations

### Password Security
- bcrypt with 12 rounds for hashing
- Minimum 8 characters with complexity requirements
- No password storage in logs or client-side

### Session Security
- JWT tokens with 30-day expiration
- HTTP-only cookies prevent XSS
- Secure cookie flags in production
- CSRF protection enabled

### Rate Limiting
- Email verification: 3 attempts per 15 minutes
- Registration: 10 users per week (beta)
- Failed login attempts: Progressive delays

### Data Protection
- Email normalization (lowercase)
- SQL injection prevention via Prisma
- Input validation with Zod schemas
- No sensitive data in error messages

## Deployment Notes

### Production Checklist
- [ ] Set strong NEXTAUTH_SECRET (32+ chars)
- [ ] Configure production database
- [ ] Set up email service (Resend recommended)
- [ ] Enable HTTPS for secure cookies
- [ ] Configure proper CORS settings
- [ ] Set up monitoring and logging
- [ ] Test all auth flows in production

### Environment-Specific Settings
- Development: Detailed error logging
- Production: Minimal error exposure
- Test: Isolated database and fast bcrypt

## Troubleshooting

### Common Issues
1. **"Configuration" error**: Check NEXTAUTH_SECRET and NEXTAUTH_URL
2. **Email not sending**: Verify email service configuration
3. **Database errors**: Ensure Prisma migrations are applied
4. **Session issues**: Clear browser cookies and test again
5. **CSRF errors**: Check if NEXTAUTH_URL matches current domain

### Debug Mode
```env
# Enable in development only
NODE_ENV=development
```

This will enable:
- Detailed NextAuth.js logging
- Auth configuration validation
- Enhanced error messages
- Provider status logging

## Support

For issues or questions about the authentication system:
- Check the troubleshooting section above
- Review NextAuth.js documentation
- Contact development team
- File issues in project repository

---

**Last Updated**: September 2024
**NextAuth.js Version**: 4.24.0
**Status**: Production Ready ✅