import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Same origin — no baseURL needed when FE and BE share the same port
  baseURL: import.meta.env.VITE_APP_URL ?? window.location.origin,
});

export const { signIn, signUp, signOut, useSession } = authClient;
