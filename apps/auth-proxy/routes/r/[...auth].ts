import { Auth } from "@auth/core";
import Google from "@auth/core/providers/google";
import Credentials from "@auth/core/providers/credentials";
import { eventHandler, toWebRequest } from "h3";
import { compare } from "bcrypt";
import { db } from "@ars/db";
import { users } from "@ars/db/schema";
import { eq } from "drizzle-orm";

export default eventHandler(async (event) =>
  Auth(toWebRequest(event), {
    basePath: "/r",
    secret: process.env.AUTH_SECRET,
    trustHost: !!process.env.VERCEL,
    redirectProxyUrl: process.env.AUTH_REDIRECT_PROXY_URL,
    providers: [
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      }),
      Credentials({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;
          
          const user = await db.query.users.findFirst({
            where: eq(users.email, credentials.email),
          });

          if (!user || !user.password) return null;

          const isValidPassword = await compare(credentials.password, user.password);
          if (!isValidPassword) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }
      }),
    ],
    pages: {
      signIn: "/auth/signin",
    },
  }),
);
