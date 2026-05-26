import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  appName: "Collageboard",
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
});
