import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * NextAuth.js API route handler for authentication
 *
 * This handles all authentication routes including:
 * - POST /api/auth/signin
 * - POST /api/auth/signout
 * - GET /api/auth/session
 * - GET /api/auth/csrf
 * - GET /api/auth/callback/[provider]
 * - GET /api/auth/providers
 *
 * @see https://next-auth.js.org/configuration/initialization#route-handlers-app
 */

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }