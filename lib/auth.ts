import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import dbConnect from './dbConnect';
import env from './env';
import UserModel from './models/UserModel';

export const config = {
  trustHost: true, // Allow all hosts in production
  debug: process.env.AUTH_DEBUG === 'true' || process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-render-deployment-please-set-proper-secret',
  basePath: '/api/auth',
  // Add explicit URL configuration for Render
  ...(process.env.NEXTAUTH_URL && { url: process.env.NEXTAUTH_URL }),
  providers: [
    CredentialsProvider({
      credentials: {
        email: {
          type: 'email',
        },
        password: {
          type: 'password',
        },
      },
      async authorize(credentials) {
        try {
          await dbConnect();
          if (credentials === null) return null;

          const user = await UserModel.findOne({ email: credentials.email });

          if (user) {
            const isMatch = await bcrypt.compare(
              credentials.password as string,
              user.password,
            );
            if (isMatch) {
              return {
                id: user._id.toString(),
                _id: user._id.toString(),
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin,
              };
            }
          }
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  // Enhanced session configuration for security and speed
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 5 * 60, // Update every 5 minutes for faster refresh
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  // custom pages for sign in and register
  pages: {
    signIn: '/signin',
    newUser: '/register',
    error: '/error',
  },
  callbacks: {
    async jwt({ user, token }: any) {
      // If user is signing in, add user data to token
      if (user) {
        const idStr = typeof user._id === 'string' 
          ? user._id 
          : user._id?.toString() || user.id;
        
        token.user = {
          id: idStr,
          _id: idStr,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
        };
      }
      return token;
    },
    session: async ({ session, token }: any) => {
      if (token?.user) {
        session.user = {
          id: token.user.id,
          _id: token.user._id,
          email: token.user.email,
          name: token.user.name,
          isAdmin: token.user.isAdmin,
        };
      }
      return session;
    },
    async signIn({ user, account, profile }: any) {
      // Additional security checks during sign in
      if (user?.email) {
        // Log successful login (without sensitive data)
        console.log(`Successful login attempt for user: ${user.email.substring(0, 3)}***`);
        return true;
      }
      return false;
    },
  },
  // Enhanced security settings
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Don't set domain for Render deployment - let it auto-detect
        maxAge: 24 * 60 * 60, // 24 hours
      },
    },
  },
  // Security events logging
  events: {
    async signIn({ user, account, profile, isNewUser }: any) {
      console.log(`User signed in: ${user?.email?.substring(0, 3)}***`);
    },
    async signOut({ session, token }: any) {
      console.log(`User signed out: ${token?.user?.email?.substring(0, 3)}***`);
    },
  },
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(config);
