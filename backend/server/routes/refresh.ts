import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "../db";
import {
  refreshToken as refreshTokenTable,
  REFRESH_TOKEN_EXPIRY_MS,
} from "../db/schema/refresh-tokens";
import { session as sessionTable } from "../db/schema/auth";
import type { Context } from "hono";
import { z } from "zod";
import { defaultHook, UnauthorizedSchema } from "../lib/openapi-schemas";

// ─── Access session expiry ────────────────────────────────────────────────────
// Mirrors the value in auth.ts so both files stay in sync via this constant.
// If you change ACCESS_SESSION_EXPIRY_S in auth.ts, change it here too.
// const ACCESS_SESSION_EXPIRY_S = 15 * 60; // 15 minutes — edit for testing
const ACCESS_SESSION_EXPIRY_S = 8 * 60 * 60; // 8 hours — edit for testing

// ─── Cookie name ─────────────────────────────────────────────────────────────
export const REFRESH_TOKEN_COOKIE = "refresh_token";

// ─── Helper: create a refresh token DB row ────────────────────────────────────
/**
 * Inserts a new refresh token record for the given user.
 * Returns the raw opaque token string.
 * Called from auth.ts databaseHooks after every new session creation.
 */
export async function createRefreshToken(
  userId: string,
  _sessionId: string
): Promise<string> {
  const token = crypto.randomUUID() + "-" + crypto.randomUUID();
  const now = new Date();

  await db.insert(refreshTokenTable).values({
    id: crypto.randomUUID(),
    token,
    userId,
    expiresAt: new Date(now.getTime() + REFRESH_TOKEN_EXPIRY_MS),
    createdAt: now,
    revokedAt: null,
  });

  return token;
}

// ─── Helper: write refresh token httpOnly cookie ──────────────────────────────
export function setRefreshTokenCookie(c: Context, token: string) {
  setCookie(c, REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    maxAge: Math.floor(REFRESH_TOKEN_EXPIRY_MS / 1000),
  });
}

// ─── Routes ──────────────────────────────────────────────────────────────────
const app = new OpenAPIHono({ defaultHook });

const postRefresh = createRoute({
  method: "post",
  path: "/refresh",
  tags: ["Auth"],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ ok: z.boolean() }),
        },
      },
      description: "Successfully refreshed the token",
    },
    401: {
      content: {
        "application/json": {
          schema: UnauthorizedSchema,
        },
      },
      description: "Unauthorized",
    },
  },
});

const postRevoke = createRoute({
  method: "post",
  path: "/revoke-refresh-token",
  tags: ["Auth"],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ ok: z.boolean() }),
        },
      },
      description: "Successfully revoked token",
    },
  },
});

const postSignInEmail = createRoute({
  method: "post",
  path: "/sign-in/email",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            email: z.string().email(),
            password: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successfully signed in",
      content: {
        "application/json": {
          schema: z.object({
            user: z.object({ id: z.string(), email: z.string(), name: z.string() }),
            session: z.object({ token: z.string() }),
          }),
        },
      },
    },
  },
});

const postSignUpEmail = createRoute({
  method: "post",
  path: "/sign-up/email",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            email: z.string().email(),
            password: z.string(),
            name: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successfully signed up",
      content: {
        "application/json": {
          schema: z.object({
            user: z.object({ id: z.string(), email: z.string(), name: z.string() }),
            session: z.object({ token: z.string() }),
          }),
        },
      },
    },
  },
});

const postSignOut = createRoute({
  method: "post",
  path: "/sign-out",
  tags: ["Auth"],
  responses: {
    200: {
      description: "Successfully signed out",
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean() }),
        },
      },
    },
  },
});

export const refreshRoute = app
  .openapi(postRefresh, async (c) => {
    const incomingToken = getCookie(c, REFRESH_TOKEN_COOKIE);

    if (!incomingToken) {
      return c.json({ error: "No refresh token" }, 401);
    }

    // 1. Validate stored token
    const [stored] = await db
      .select()
      .from(refreshTokenTable)
      .where(
        and(
          eq(refreshTokenTable.token, incomingToken),
          isNull(refreshTokenTable.revokedAt)
        )
      )
      .limit(1);

    if (!stored) {
      deleteCookie(c, REFRESH_TOKEN_COOKIE, { path: "/" });
      return c.json({ error: "Invalid or revoked refresh token" }, 401);
    }

    if (stored.expiresAt < new Date()) {
      await db
        .update(refreshTokenTable)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokenTable.id, stored.id));
      deleteCookie(c, REFRESH_TOKEN_COOKIE, { path: "/" });
      return c.json({ error: "Refresh token expired" }, 401);
    }

    // 2. Rotate: revoke the consumed token
    await db
      .update(refreshTokenTable)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokenTable.id, stored.id));

    // 3. Create a new Better Auth session row directly
    const sessionToken = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    const now = new Date();
    const sessionExpiresAt = new Date(now.getTime() + ACCESS_SESSION_EXPIRY_S * 1000);

    await db.insert(sessionTable).values({
      id: sessionId,
      token: sessionToken,
      userId: stored.userId,
      expiresAt: sessionExpiresAt,
      createdAt: now,
      updatedAt: now,
      ipAddress: c.req.header("x-forwarded-for") ?? null,
      userAgent: c.req.header("user-agent") ?? null,
    });

    // 4. Mint a new refresh token (rotation); this also inserts a DB row.
    const newRefreshToken = await createRefreshToken(stored.userId, sessionId);

    // Set the Better Auth session cookie
    setCookie(c, "better-auth.session_token", sessionToken, {
      httpOnly: true,
      sameSite: "Lax",
      path: "/",
      maxAge: ACCESS_SESSION_EXPIRY_S,
    });

    // Set the new refresh token cookie
    setRefreshTokenCookie(c, newRefreshToken);

    return c.json({ ok: true }, 200);
  })
  .openapi(postRevoke, async (c) => {
    const incomingToken = getCookie(c, REFRESH_TOKEN_COOKIE);

    if (incomingToken) {
      await db
        .update(refreshTokenTable)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(refreshTokenTable.token, incomingToken),
            isNull(refreshTokenTable.revokedAt)
          )
        );
    }

    deleteCookie(c, REFRESH_TOKEN_COOKIE, { path: "/" });
    return c.json({ ok: true }, 200);
  })
  .openapi(postSignInEmail, async (c) => {
    // Stub endpoint for OpenAPI generation.
    // BetterAuth's global interceptor catches this request before it reaches here.
    return c.json({} as any, 200);
  })
  .openapi(postSignUpEmail, async (c) => {
    // Stub endpoint for OpenAPI generation.
    return c.json({} as any, 200);
  })
  .openapi(postSignOut, async (c) => {
    // Stub endpoint for OpenAPI generation.
    return c.json({} as any, 200);
  });
