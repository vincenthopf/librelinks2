import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { db } from '@/lib/db';
import NextAuth from 'next-auth/next';
import { nanoid } from 'nanoid';

// Determine the correct URL to use for callbacks
const useSecureProtocol = process.env.NODE_ENV === 'production';
const defaultHost = process.env.NEXTAUTH_URL || 'https://ultimate-aware-worm.ngrok-free.app';
const ngrokHost = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
  ? `https://${process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}`
  : null;

export const authOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
  },
  pages: {
    newUser: '/onboarding',
    signIn: '/login',
    error: '/login',
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.handle = token.handle;
        session.user.isAdmin = token.isAdmin;
        session.user.buttonStyle = token.buttonStyle;
        session.user.themePalette = token.themePalette;
      }
      return session;
    },

    async jwt({ token, user }) {
      const dbUser = await db.user.findFirst({
        where: {
          email: token.email,
        },
      });

      if (!dbUser) {
        if (user) {
          // Set isAdmin for new users
          const isAdmin = user.email === 'dominic@workcentivo.com';
          await db.user.update({
            where: { id: user.id },
            data: { isAdmin },
          });
          token.id = user.id;
          token.isAdmin = isAdmin;
        }
        return token;
      }

      if (!dbUser.handle) {
        await db.user.update({
          where: {
            id: dbUser.id,
          },
          data: {
            handle: nanoid(10),
          },
        });
      }

      // Update isAdmin status if email changes to/from admin email
      const isAdmin = dbUser.email === 'dominic@workcentivo.com';
      if (dbUser.isAdmin !== isAdmin) {
        await db.user.update({
          where: { id: dbUser.id },
          data: { isAdmin },
        });
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        handle: dbUser.handle,
        isAdmin: isAdmin,
        buttonStyle: dbUser.buttonStyle,
        themePalette: dbUser.themePalette,
      };
    },

    redirect({ url, baseUrl }) {
      // Handle ngrok URLs properly
      const ngrokDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

      // Check if the URL is relative
      if (url.startsWith('/')) {
        // For relative URLs, use ngrok URL if available, otherwise baseUrl
        return `${ngrokHost || baseUrl}${url}`;
      }

      // For absolute URLs, pass through ones that match our domains
      if (url.startsWith('http')) {
        if (ngrokDomain && url.includes(ngrokDomain)) {
          return url;
        }

        if (url.includes('localhost') || url.includes('127.0.0.1')) {
          return url;
        }
      }

      // Default admin page using ngrok if available
      return ngrokHost ? `${ngrokHost}/admin` : `${baseUrl}/admin`;
    },
  },
};

export default NextAuth(authOptions);
