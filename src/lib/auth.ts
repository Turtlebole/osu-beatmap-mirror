import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import OsuProvider from "next-auth/providers/osu";

// Extend the session and JWT types
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      country?: {
        code: string;
        name: string;
      };
    };
  }
  
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    country?: {
      code: string;
      name: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
    osuId?: string;
    error?: string;
    userCountry?: {
      code: string;
      name: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    OsuProvider({
      clientId: process.env.OSU_CLIENT_ID as string,
      clientSecret: process.env.OSU_CLIENT_SECRET as string,
      authorization: {
        params: { 
          scope: "identify public" 
        }
      },
      token: {
        params: {
          grant_type: "authorization_code"
        }
      },
      userinfo: {
        url: "https://osu.ppy.sh/api/v2/me"
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.username,
          email: null,
          image: profile.avatar_url,
          country: profile.country ? {
            code: profile.country.code,
            name: profile.country.name
          } : undefined
        }
      }
    })
  ],
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, user }) {
      // Add the access token and expiry to the token right after signing in
      if (account) {
        token.accessToken = account.access_token;
        token.accessTokenExpires = account.expires_at;
        token.refreshToken = account.refresh_token;
        token.osuId = account.providerAccountId;
      }
      
      // Store the country in the JWT token if available
      if (user && user.country) {
        token.userCountry = user.country;
      }
      
      // If the token has expired and we have a refresh token, refresh it
      const now = Date.now() / 1000;
      if (token.accessTokenExpires && token.accessTokenExpires < now && token.refreshToken) {
        try {
          // Get a new access token
          const response = await fetch("https://osu.ppy.sh/oauth/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              client_id: process.env.OSU_CLIENT_ID as string,
              client_secret: process.env.OSU_CLIENT_SECRET as string,
              grant_type: "refresh_token",
              refresh_token: token.refreshToken,
              scope: "identify public",
            }),
          });
          
          const newToken = await response.json();
          
          if (!response.ok) throw newToken;
          
          token.accessToken = newToken.access_token;
          token.accessTokenExpires = Math.floor(Date.now() / 1000 + newToken.expires_in);
          token.refreshToken = newToken.refresh_token ?? token.refreshToken;
        } catch (error) {
          console.error("Error refreshing access token", error);
          // The refresh token has expired, sign the user out
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      // Add the access token to the session so we can use it in API calls
      session.accessToken = token.accessToken;
      session.error = token.error;
      if (session.user) {
        session.user.id = token.osuId;
        session.user.country = token.userCountry;
      }
      
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/en/signin",
    error: "/en/signin",
  },
};

// Export handler function for API routes
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 