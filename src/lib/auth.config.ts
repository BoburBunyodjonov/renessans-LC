import type { NextAuthConfig } from 'next-auth';
import type { Role } from '@/lib/permissions';

/**
 * Edge-safe half of the auth setup: no Prisma, no bcrypt, so `middleware.ts`
 * can import it. The credentials provider lives in `lib/auth.ts`.
 */
export const authConfig = {
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: Role }).role;
        token.name = user.name ?? token.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.role = (token.role as Role) ?? 'VIEWER';
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
