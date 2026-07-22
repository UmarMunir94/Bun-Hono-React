import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { educationRoute } from "./routes/education";
import { workExperienceRoute } from "./routes/work-experience";
import { refreshRoute, REFRESH_TOKEN_COOKIE } from "./routes/refresh";
import { auth } from "./auth";
import { sessionMiddleware } from "./auth-middleware";
import { db } from "./db";
import { refreshToken as refreshTokenTable } from "./db/schema/refresh-tokens";
import { session as sessionTable } from "./db/schema/auth";
import { eq, isNull, desc } from "drizzle-orm";

type AppVariables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

const app = new OpenAPIHono<{ Variables: AppVariables }>();

app.use(
  "*",
  cors({
    origin: ["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:5173"],
    credentials: true,
  })
);
app.use("*", logger());

// Populate c.var.user and c.var.session on every request
app.use("*", sessionMiddleware);

// ── Better Auth handles all /api/auth/* routes ────────────────────────────────
// We intercept successful sign-in / sign-up responses to append the
// refresh_token cookie that was created by the databaseHooks in auth.ts.
app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  const response = await auth.handler(c.req.raw);

  const isSignInOrUp =
    c.req.method === "POST" &&
    (c.req.path.includes("/sign-in/") || c.req.path.includes("/sign-up/")) &&
    response.status === 200;

  if (!isSignInOrUp) return response;

  // Extract the session token Better Auth just issued from its Set-Cookie header
  const setCookieHeader = response.headers.get("set-cookie") ?? "";
  const sessionTokenMatch = setCookieHeader.match(
    /better-auth\.session_token=([^;]+)/
  );
  if (!sessionTokenMatch) return response;

  const sessionToken = sessionTokenMatch[1];

  // Look up the session row to get the userId
  const [sessionRow] = await db
    .select({ userId: sessionTable.userId })
    .from(sessionTable)
    .where(eq(sessionTable.token, sessionToken))
    .limit(1);

  if (!sessionRow) return response;

  // Fetch the most recently created non-revoked refresh token for this user
  const [latestRefresh] = await db
    .select({ token: refreshTokenTable.token, expiresAt: refreshTokenTable.expiresAt })
    .from(refreshTokenTable)
    .where(
      eq(refreshTokenTable.userId, sessionRow.userId) &&
        isNull(refreshTokenTable.revokedAt)
    )
    .orderBy(desc(refreshTokenTable.createdAt))
    .limit(1);

  if (!latestRefresh) return response;

  // Clone the response and append the refresh_token Set-Cookie header
  const maxAge = Math.floor((latestRefresh.expiresAt.getTime() - Date.now()) / 1000);
  const cloned = new Response(response.body, response);
  cloned.headers.append(
    "Set-Cookie",
    `${REFRESH_TOKEN_COOKIE}=${latestRefresh.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`
  );
  return cloned;
});

// ── Custom refresh-token endpoints ────────────────────────────────────────────
app.route("/api/auth", refreshRoute);

import { generalInfoRoute } from "./routes/general-info";

// ── OpenAPI Schema and Scalar UI ──────────────────────────────────────────────
app.doc("/api/openapi.json", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Application API",
  },
});

app.get(
  "/api/docs",
  apiReference({
    theme: "saturn",
    spec: { url: "/api/openapi.json" },
  })
);

// ── Application API routes ────────────────────────────────────────────────────
const apiRoutes = app
  .basePath("/api")
  .openapi(
    createRoute({
      method: "get",
      path: "/me",
      responses: {
        200: {
          content: {
            "application/json": {
              schema: z.object({
                user: z.record(z.string(), z.any()), // basic typing for now
              }),
            },
          },
          description: "Get current authenticated user",
        },
        401: {
          content: {
            "application/json": {
              schema: z.object({ error: z.string() }),
            },
          },
          description: "Unauthorized",
        },
      },
    }),
    (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);
      return c.json({ user }, 200);
    }
  )
  .route("/education", educationRoute)
  .route("/work-experience", workExperienceRoute)
  .route("/general-info", generalInfoRoute);

app.get("*", serveStatic({ root: "./frontend/dist" }));
app.get("*", serveStatic({ path: "./frontend/dist/index.html" }));

export default app;
export type ApiRoutes = typeof apiRoutes;