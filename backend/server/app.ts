import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
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
import { apiReference } from "@scalar/hono-api-reference";
import { generalInfoRoute } from "./routes/general-info";
import { UserSchema, UnauthorizedSchema } from "./lib/openapi-schemas";
import { z } from "zod";

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

// ── Application API routes ────────────────────────────────────────────────────
const apiApp = new OpenAPIHono<{ Variables: AppVariables }>();

const getMeRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["Auth"],
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ user: UserSchema.shape.user }) } },
      description: "Current user session",
    },
    401: {
      content: { "application/json": { schema: UnauthorizedSchema } },
      description: "Unauthorized",
    },
  },
});

const meApp = new OpenAPIHono<{ Variables: AppVariables }>().openapi(getMeRoute, (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  
  // Coerce dates to strings
  const mappedUser = {
    ...user,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt),
    updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : String(user.updatedAt),
  };
  
  return c.json({ user: mappedUser as any }, 200);
});

import { authCheckRoute } from "./routes/auth-check";

const apiRoutes = apiApp
  .route("/auth", refreshRoute)
  .route("/", authCheckRoute)
  .route("/", meApp)
  .route("/education", educationRoute)
  .route("/work-experience", workExperienceRoute)
  .route("/general-info", generalInfoRoute);

// ── OpenAPI spec + Scalar UI ──────────────
apiApp.doc31("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Axentia API",
    version: "1.0.0",
  },
  servers: [{ url: "http://localhost:5173/api" }],
});

apiApp.get(
  "/docs",
  apiReference({
    theme: "saturn",
    spec: { url: "/api/openapi.json" },
  })
);

const routes = app.route("/api", apiRoutes);

app.get("*", serveStatic({ root: "./frontend/dist" }));
app.get("*", serveStatic({ path: "./frontend/dist/index.html" }));

export default app;
export type ApiRoutes = typeof routes;