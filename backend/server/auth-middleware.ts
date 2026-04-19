import { createMiddleware } from "hono/factory";
import { auth } from "./auth";

type AuthVariables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

/**
 * sessionMiddleware — runs on all routes.
 * Populates c.var.user and c.var.session from the Better Auth session cookie.
 */
export const sessionMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      c.set("user", null);
      c.set("session", null);
    } else {
      c.set("user", session.user);
      c.set("session", session.session);
    }
    await next();
  }
);

/**
 * getUser — protects individual routes.
 * Returns 401 if session is not present.
 */
export const getUser = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    await next();
  }
);
