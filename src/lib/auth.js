import { betterAuth } from "better-auth";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "bazardor-secret-key-batch14-assignment7",
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "demo-google-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "demo-google-secret",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "demo-github-id",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "demo-github-secret",
    },
  },
});