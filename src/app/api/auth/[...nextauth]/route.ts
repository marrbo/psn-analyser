import NextAuth, { type AuthOptions } from 'next-auth';
import type { OAuthConfig } from 'next-auth/providers';

const fusionAuthProvider: OAuthConfig<any> = {
  id: 'fusionauth',
  name: 'FusionAuth',
  type: 'oauth',
  wellKnown: `${process.env.FUSIONAUTH_URL}/.well-known/openid-configuration`,
  authorization: { 
    params: { 
      scope: 'openid offline_access',
      redirect_uri: process.env.FUSIONAUTH_REDIRECT_URI,
    } 
  },
  clientId: process.env.FUSIONAUTH_CLIENT_ID,
  clientSecret: process.env.FUSIONAUTH_CLIENT_SECRET,
  checks: ['pkce', 'state'],
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name || profile.preferred_username,
      email: profile.email,
      image: profile.picture,
    }
  },
};

const authOptions: AuthOptions = {
  providers: [fusionAuthProvider],
  // ... resto do código permanece igual
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };