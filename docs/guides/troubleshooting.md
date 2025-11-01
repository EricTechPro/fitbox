# FitBox Troubleshooting Guide

Common issues and solutions for the FitBox meal delivery application.

**Last Updated**: 2025-11-01

---

## Table of Contents

- [Development Environment](#development-environment)
- [Database Issues](#database-issues)
- [Authentication Problems](#authentication-problems)
- [API Errors](#api-errors)
- [Build & Deployment](#build--deployment)
- [Testing Issues](#testing-issues)
- [Performance Problems](#performance-problems)

---

## Development Environment

### Issue: `npm install` Fails

**Symptoms**:

```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions**:

1. **Clear npm cache**:

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

2. **Use legacy peer deps** (if peer dependency conflicts):

```bash
npm install --legacy-peer-deps
```

3. **Check Node.js version**:

```bash
node --version  # Should be 18.x or higher
nvm use 18      # If using nvm
```

---

### Issue: Port 3000 Already in Use

**Symptoms**:

```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions**:

1. **Kill the process using port 3000**:

```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

2. **Use a different port**:

```bash
PORT=3001 npm run dev
```

---

### Issue: TypeScript Errors After Pull

**Symptoms**:

```bash
Type error: Property 'xyz' does not exist on type...
```

**Solutions**:

1. **Regenerate Prisma client**:

```bash
npx prisma generate
```

2. **Clear Next.js cache**:

```bash
rm -rf .next
npm run dev
```

3. **Check TypeScript version**:

```bash
npm list typescript
npm install typescript@latest --save-dev
```

---

## Database Issues

### Issue: Database Connection Failed

**Symptoms**:

```bash
PrismaClientInitializationError: Can't reach database server
```

**Solutions**:

1. **Check DATABASE_URL in .env.local**:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/fitbox_dev"
```

2. **Verify PostgreSQL is running**:

```bash
# macOS
brew services list
brew services start postgresql

# Linux
sudo systemctl status postgresql
sudo systemctl start postgresql

# Docker
docker ps
docker-compose up -d postgres
```

3. **Test connection manually**:

```bash
psql -U username -d fitbox_dev
```

---

### Issue: Prisma Migration Fails

**Symptoms**:

```bash
Error: Migration failed to apply
```

**Solutions**:

1. **Reset database** (development only):

```bash
npm run db:reset
```

2. **Check migration status**:

```bash
npx prisma migrate status
```

3. **Resolve migration conflicts**:

```bash
# Mark migration as applied (if already manually applied)
npx prisma migrate resolve --applied <migration_name>

# Roll back failed migration
npx prisma migrate resolve --rolled-back <migration_name>
```

---

### Issue: Seed Data Not Loading

**Symptoms**:

```bash
npm run db:seed
# No error but data not appearing
```

**Solutions**:

1. **Check seed script**:

```bash
# Verify seed file exists
cat prisma/seed.ts

# Run with verbose output
npx prisma db seed --preview-feature
```

2. **Reset and reseed**:

```bash
npm run db:reset
```

3. **Check for unique constraint violations**:

```bash
# Clear existing data first
npx prisma studio  # Manually delete conflicting records
```

---

## Authentication Problems

### Issue: NextAuth Session Not Persisting

**Symptoms**:

- User logs in successfully but session disappears on page reload
- `useSession()` returns `null` unexpectedly

**Solutions**:

1. **Check NEXTAUTH_SECRET**:

```env
# .env.local
NEXTAUTH_SECRET="your-secret-here-min-32-characters"
```

Generate new secret:

```bash
openssl rand -base64 32
```

2. **Verify NEXTAUTH_URL**:

```env
NEXTAUTH_URL="http://localhost:3000"
```

3. **Clear browser cookies**:

```javascript
// In browser console
document.cookie.split(';').forEach(c => {
  document.cookie = c
    .replace(/^ +/, '')
    .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
})
```

4. **Check session strategy**:

```typescript
// src/lib/auth-config.ts
export const authOptions = {
  session: {
    strategy: 'jwt', // Should be "jwt" not "database"
  },
  // ...
}
```

---

### Issue: Signup Returns 500 Error

**Symptoms**:

```json
{
  "error": "Internal Server Error",
  "status": 500
}
```

**Solutions**:

1. **Check password hashing**:

```bash
npm list bcrypt bcryptjs
# Ensure bcryptjs is installed
npm install bcryptjs
```

2. **Verify database connection**:

```bash
# Test database connectivity
npm run db:studio
```

3. **Check server logs**:

```bash
# Development server shows detailed errors
npm run dev
```

4. **Validate user schema**:

```typescript
// Ensure User model has required fields
// prisma/schema.prisma
model User {
  id       String @id @default(cuid())
  email    String @unique
  password String
  name     String
  // ...
}
```

---

## API Errors

### Issue: CORS Errors in Development

**Symptoms**:

```
Access to fetch at 'http://localhost:3000/api/...' from origin 'http://localhost:3001' has been blocked by CORS policy
```

**Solutions**:

1. **Check API route configuration**:

```typescript
// src/app/api/.../route.ts
export async function GET(request: Request) {
  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    },
  })
}
```

2. **Use Next.js middleware**:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  response.headers.set('Access-Control-Allow-Origin', '*')
  return response
}
```

---

### Issue: API Returns 405 Method Not Allowed

**Symptoms**:

```json
{
  "error": "Method Not Allowed",
  "status": 405
}
```

**Solutions**:

1. **Ensure method is exported**:

```typescript
// src/app/api/example/route.ts
export async function GET(request: Request) { ... }
export async function POST(request: Request) { ... }
// Must export the method you're trying to call
```

2. **Check HTTP method matches**:

```typescript
// Frontend
fetch('/api/example', {
  method: 'POST', // Ensure this matches backend export
  // ...
})
```

---

### Issue: Rate Limiting Blocking Requests

**Symptoms**:

```json
{
  "error": "Too Many Requests",
  "status": 429
}
```

**Solutions**:

1. **Increase rate limit** (development only):

```typescript
// Adjust rate limit settings
const rateLimit = {
  windowMs: 60 * 1000,
  max: 1000, // Increase for development
}
```

2. **Clear rate limit cache**:

```bash
# Redis
redis-cli FLUSHALL

# In-memory
# Restart development server
```

3. **Use different IP/account**:

```bash
# Test with different user
# or use incognito mode
```

---

## Build & Deployment

### Issue: Build Fails with Type Errors

**Symptoms**:

```bash
Type error: Cannot find module...
npm run build failed
```

**Solutions**:

1. **Run type check first**:

```bash
npm run type-check
```

2. **Fix import paths**:

```typescript
// Use absolute imports
import { Button } from '@/components/ui/button'
// Not relative imports
import { Button } from '../../../components/ui/button'
```

3. **Check tsconfig.json**:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### Issue: Vercel Deployment Fails

**Symptoms**:

```
Error: Command "npm run build" exited with 1
```

**Solutions**:

1. **Check environment variables**:

```bash
# Ensure all required env vars are set in Vercel dashboard
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- STRIPE_SECRET_KEY
```

2. **Verify build locally**:

```bash
npm run build
npm run start
```

3. **Check Vercel logs**:

```bash
vercel logs <deployment-url>
```

4. **Ensure Node.js version matches**:

```json
// package.json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## Testing Issues

### Issue: Tests Fail to Connect to Database

**Symptoms**:

```bash
Test suite failed to run
PrismaClientInitializationError
```

**Solutions**:

1. **Use test database**:

```env
# .env.test
DATABASE_URL="postgresql://user:password@localhost:5432/fitbox_test"
```

2. **Setup test database**:

```bash
# Create test database
createdb fitbox_test

# Push schema
DATABASE_URL="..." npx prisma db push
```

3. **Reset between tests**:

```typescript
// tests/setup.ts
afterEach(async () => {
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.meal.deleteMany(),
  ])
})
```

---

### Issue: E2E Tests Timeout

**Symptoms**:

```bash
Timeout of 30000ms exceeded
```

**Solutions**:

1. **Increase timeout**:

```typescript
// playwright.config.ts
export default defineConfig({
  timeout: 60000, // 60 seconds
  expect: {
    timeout: 10000,
  },
})
```

2. **Wait for elements properly**:

```typescript
// Instead of
await page.locator('button').click()

// Use
await page.waitForSelector('button')
await page.locator('button').click()
```

3. **Check server is running**:

```bash
# Start dev server before E2E tests
npm run dev &
npm run test:e2e
```

---

## Performance Problems

### Issue: Slow Page Load Times

**Symptoms**:

- Pages take > 3 seconds to load
- Poor Core Web Vitals scores

**Solutions**:

1. **Analyze bundle size**:

```bash
npm run build
# Check .next/analyze output

# Install analyzer
npm install @next/bundle-analyzer
```

2. **Implement code splitting**:

```typescript
// Use dynamic imports
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

3. **Optimize images**:

```typescript
import Image from 'next/image';

<Image
  src="/meal.jpg"
  width={600}
  height={400}
  alt="Meal"
  loading="lazy"
/>
```

4. **Check database queries**:

```typescript
// Enable query logging
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Log slow queries
const result = await prisma.meal.findMany({
  // Add indexes for frequently queried fields
});
```

---

## Getting Additional Help

### Where to Look

1. **Documentation**:
   - [Development Guide](../development/README.md)
   - [Testing Guide](../development/testing-guide.md)
   - [API Documentation](../specifications/api-endpoints.md)

2. **Logs**:
   - Development server console
   - Browser console (F12)
   - Vercel deployment logs
   - Database logs

3. **Debug Tools**:
   - Prisma Studio: `npm run db:studio`
   - Next.js Debug: Set `NODE_OPTIONS='--inspect'`
   - React DevTools browser extension

### Reporting Issues

When reporting issues, include:

1. **Environment**:
   - OS and version
   - Node.js version (`node --version`)
   - npm/yarn version
   - Database version

2. **Error Details**:
   - Full error message
   - Stack trace
   - Steps to reproduce

3. **Context**:
   - What you were trying to do
   - What you expected to happen
   - What actually happened

---

**Note**: If you encounter an issue not covered here, check the [Development Guide](../development/README.md) or create a detailed bug report with the information listed above.
