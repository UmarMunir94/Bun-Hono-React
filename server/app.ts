import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import { expensesRoute } from "./routes/expenses";
import { auth } from "./auth";
import { sessionMiddleware } from "./auth-middleware";

type AppVariables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

const app = new Hono<{ Variables: AppVariables }>();

app.use("*", logger());

// Populate c.var.user and c.var.session on every request
app.use("*", sessionMiddleware);

// Better Auth handles all /api/auth/* routes (sign-in, sign-up, callback, sign-out, …)
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

const apiRoutes = app
  .basePath("/api")
  .get("/me", (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);
    return c.json({ user });
  })
  .route("/expenses", expensesRoute);

app.get("*", serveStatic({ root: "./frontend/dist" }));
app.get("*", serveStatic({ path: "./frontend/dist/index.html" }));

export default app;
export type ApiRoutes = typeof apiRoutes;