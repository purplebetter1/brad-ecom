import { authConfig } from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db/prisma";
import { cookies } from "next/headers";
import { compareSync } from "bcrypt-ts-edge";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (credentials == null) return null;

        // Find user in DB
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });
        // Check if user exists and if password matches
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );
          // If password is correct - return user
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        // If user does not exist or if password not match, return null
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, user, trigger, token }: any) {
      // Set user id from token
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.name = token.name;

      // If there is an update, set user name
      if (trigger === "update") {
        session.user.name = user.name;
      }

      return session;
    },
    async jwt({ token, session, user, trigger }: any) {
      // Assign user fields to token
      if (user) {
        token.role = user.role;
        // if user has no name use first part of email
        if (user.name === "NO_NAME") {
          token.name = user.email!.split("@")[0];

          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }
      }
      return token;
    },
    ...authConfig.callbacks,
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
