import { AuthSession } from '@app/common/types';
import { getPrivateKey } from '@app/utils/fetch-wallet/fetch-shareB';
import { GetPrivateKeyResponse } from '@app/utils/fetch-wallet/types';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      const data = await getPrivateKey({ owner: user.email, verifier: "google", idToken: account.id_token });
      if (data.error) {
        throw new Error(data.error.errorMessage);
      }
      account.wallet = data.data;
      return true;
    },
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.id_token = account.id_token;
        token.wallet = account.wallet;
        token.userRole = 'admin'
      }
      return token;
    },
    async session(params) {
      // Send properties to the client, like an access_token from a provider.
      const token = params.token;
      const session = params.session as AuthSession;
      session.id_token = String(token.id_token || "");
      session.wallet = token.wallet as GetPrivateKeyResponse;
      return session;
    },
  },
});