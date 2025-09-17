import { NextAuthOptions } from "next-auth"
import { providers, adapter } from "@/lib/auth-config"
import { SecureLogger } from "@/lib/auth-security"
import { AUTH_CONSTANTS } from "@/lib/constants"

export const authOptions: NextAuthOptions = {
  adapter,
  providers,
  session: {
    strategy: "jwt",
    maxAge: AUTH_CONSTANTS.SESSION.MAX_AGE,
  },
  jwt: {
    maxAge: AUTH_CONSTANTS.SESSION.JWT_MAX_AGE,
  },
  pages: {
    signIn: AUTH_CONSTANTS.ROUTES.SIGN_IN,
    error: AUTH_CONSTANTS.ROUTES.ERROR,
    verifyRequest: AUTH_CONSTANTS.ROUTES.VERIFY_REQUEST,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.firstName = user.firstName
        token.lastName = user.lastName
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  events: {
    async createUser({ user }) {
      SecureLogger.logRegistrationAttempt(true, {
        userId: user.id,
        email: user.email
      })
    },
    async signIn({ user, account, profile, isNewUser }) {
      SecureLogger.logAuthAttempt(true, {
        userId: user.id,
        email: user.email,
        metadata: {
          provider: account?.provider || 'unknown',
          isNewUser: isNewUser || false
        }
      })
    },
  },
  debug: process.env.NODE_ENV === "development",
}

// Type definitions for extended session
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      firstName?: string | null
      lastName?: string | null
      role: string
    }
  }

  interface User {
    id: string
    email: string
    firstName?: string | null
    lastName?: string | null
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    firstName?: string | null
    lastName?: string | null
  }
}