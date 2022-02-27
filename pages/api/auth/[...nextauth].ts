import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import KeycloakProvider from 'next-auth/providers/keycloak'
import { upsertUser } from "../../../db";

export default NextAuth({
  providers: [
    process.env.GITHUB_ID && GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      httpOptions: {
        timeout: 10000,
      },
    }),
    process.env.KEYCLOAK_ISSUER && KeycloakProvider({
      issuer: process.env.KEYCLOAK_ISSUER,
      name: process.env.KEYCLOAK_NAME,
      clientId: process.env.KEYCLOAK_ID,
      clientSecret: process.env.KEYCLOAK_SECRET,
    }),
  ].filter(x => !!x),
  callbacks: {
    signIn: async ({account, profile, user}) => {
      await upsertUser({
        id: account.provider +  '-' + account.providerAccountId,
        email: profile.email,
        name: profile.name,
        image: profile.image,
      });
      return true;
    },
    jwt: async ({ token, account }) => {
      if (account) {
        token.sub = account.provider + '-' + account.providerAccountId;
      }
      return token;
    },
    session: async ({ session, user, token }) => {
      session.uid = token.sub;
      return Promise.resolve(session)
    },
  },
});
