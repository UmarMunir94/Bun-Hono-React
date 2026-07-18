/**
 * server/openapi.ts
 *
 * OpenAPI 3.1 specification + Scalar UI for the Resume Builder API.
 *
 * Uses @hono/zod-openapi@0.19.x (Zod v3 compatible) together with
 * @scalar/hono-api-reference to produce:
 *   GET /api/openapi.json  — machine-readable spec
 *   GET /api/docs          — Scalar interactive UI
 *
 * ⚠️  The existing Hono app and `export type ApiRoutes` in app.ts are NOT
 *     touched, so the frontend `hc` RPC client keeps working unchanged.
 *
 * Design: extendZodWithOpenApi() is called once here (at import time) so that
 * ALL Zod schemas in this process — including those produced by drizzle-zod —
 * gain the `.openapi()` method automatically.
 */

import { z as baseZ } from "zod";
import { extendZodWithOpenApi } from "@hono/zod-openapi";

// Extend Zod globally with .openapi() before any schema is used
extendZodWithOpenApi(baseZ);

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";

// Import our drizzle-zod–derived schemas (extendZodWithOpenApi is already applied)
import {
  createEducationSchema,
  updateEducationSchema,
  createWorkExperienceSchema,
  updateWorkExperienceSchema,
  createGeneralInfoSchema,
} from "./sharedTypes";
import { selectEducationSchema } from "./db/schema/education";
import { selectWorkExperienceSchema } from "./db/schema/work-experience";
import { selectGeneralInfoSchema } from "./db/schema/general-info";

// ─── Named response schemas (registered as $ref components) ───────────────────

const UnauthorizedSchema = z
  .object({ error: z.string().openapi({ example: "Unauthorized" }) })
  .openapi("Unauthorized");

const NotFoundSchema = z
  .object({ error: z.string().openapi({ example: "Not found" }) })
  .openapi("NotFound");

const ValidationErrorSchema = z
  .object({
    success: z.literal(false),
    error: z.object({
      issues: z.array(z.any()),
    }),
  })
  .openapi("ValidationError");

// ─── Domain schemas ───────────────────────────────────────────────────────────

const EducationItemSchema = selectEducationSchema
  .extend({
    createdAt: z.string().nullable().openapi({ description: "ISO-8601 creation timestamp" }),
  })
  .openapi("EducationItem");

const WorkExperienceItemSchema = selectWorkExperienceSchema
  .extend({
    createdAt: z.string().nullable().openapi({ description: "ISO-8601 creation timestamp" }),
  })
  .openapi("WorkExperienceItem");

const GeneralInfoItemSchema = selectGeneralInfoSchema
  .extend({
    createdAt: z.string().nullable().openapi({ description: "ISO-8601 creation timestamp" }),
    email: z
      .string()
      .email()
      .nullable()
      .optional()
      .openapi({ description: "Email managed by Better Auth — read-only here" }),
  })
  .openapi("GeneralInfoItem");

const UserSchema = z
  .object({
    id: z.string().openapi({ description: "Unique user ID" }),
    name: z.string().openapi({ description: "Display name" }),
    email: z.string().email().openapi({ description: "Email address" }),
    emailVerified: z.boolean().openapi({ description: "Whether the email has been verified" }),
    image: z.string().nullable().openapi({ description: "Profile picture URL" }),
    createdAt: z.string().openapi({ description: "ISO-8601 account creation timestamp" }),
    updatedAt: z.string().openapi({ description: "ISO-8601 last-update timestamp" }),
  })
  .openapi("User");

const RefreshOkSchema = z
  .object({ ok: z.literal(true).openapi({ example: true }) })
  .openapi("RefreshOk");

const RefreshErrorSchema = z
  .object({ error: z.string().openapi({ example: "No refresh token" }) })
  .openapi("RefreshError");

// ─── Shared helpers ───────────────────────────────────────────────────────────

/** Security requirement on all protected endpoints */
const cookieSecurity = [{ cookieAuth: [] }];

/** Path param for numeric IDs */
const numericIdParam = z.object({
  id: z
    .string()
    .regex(/^[0-9]+$/, "Must be a numeric ID")
    .openapi({ example: "42", description: "Numeric record ID" }),
});

// ─── OpenAPIHono app ──────────────────────────────────────────────────────────

export const openApiApp = new OpenAPIHono();

// ── GET /api/me ───────────────────────────────────────────────────────────────

openApiApp.openapi(
  createRoute({
    method: "get",
    path: "/api/me",
    tags: ["Auth"],
    summary: "Get current user",
    description:
      "Returns the currently authenticated user's Better Auth profile. Requires an active session cookie.",
    security: cookieSecurity,
    responses: {
      200: {
        description: "The authenticated user",
        content: {
          "application/json": { schema: z.object({ user: UserSchema }) },
        },
      },
      401: {
        description: "Not authenticated",
        content: { "application/json": { schema: UnauthorizedSchema } },
      },
    },
  }),
  // Stub handler — real logic lives in app.ts; this is never reached in prod
  // because app.ts mounts its routes first.
  (c) => c.json({ user: {} as any }, 200)
);

// ── POST /api/auth/refresh ────────────────────────────────────────────────────

openApiApp.openapi(
  createRoute({
    method: "post",
    path: "/api/auth/refresh",
    tags: ["Auth"],
    summary: "Refresh session",
    description:
      "Validates the `refresh_token` HttpOnly cookie, rotates it, and issues a fresh " +
      "Better Auth session cookie. Call this when any API request returns 401.",
    responses: {
      200: {
        description: "New session issued",
        content: { "application/json": { schema: RefreshOkSchema } },
      },
      401: {
        description: "Missing, invalid, or expired refresh token",
        content: { "application/json": { schema: RefreshErrorSchema } },
      },
    },
  }),
  (c) => c.json({ ok: true as const }, 200)
);

// ── POST /api/auth/revoke-refresh-token ──────────────────────────────────────

openApiApp.openapi(
  createRoute({
    method: "post",
    path: "/api/auth/revoke-refresh-token",
    tags: ["Auth"],
    summary: "Revoke refresh token",
    description:
      "Soft-deletes the current `refresh_token` cookie so it can never be replayed. " +
      "Call alongside Better Auth's `signOut` from your frontend logout handler.",
    responses: {
      200: {
        description: "Token revoked (idempotent — safe to call even without a token)",
        content: { "application/json": { schema: RefreshOkSchema } },
      },
    },
  }),
  (c) => c.json({ ok: true as const }, 200)
);

// ── GET /api/general-info ─────────────────────────────────────────────────────

openApiApp.openapi(
  createRoute({
    method: "get",
    path: "/api/general-info",
    tags: ["General Info"],
    summary: "Get profile info",
    description:
      "Returns the current user's general profile merged with their email from the user " +
      "table. Returns an empty object shape if no record exists yet.",
    security: cookieSecurity,
    responses: {
      200: {
        description: "Profile info (email is read-only, managed by Better Auth)",
        content: {
          "application/json": {
            schema: z.object({ generalInfo: GeneralInfoItemSchema }),
          },
        },
      },
      401: {
        description: "Not authenticated",
        content: { "application/json": { schema: UnauthorizedSchema } },
      },
    },
  }),
  (c) => c.json({ generalInfo: {} as any }, 200)
);

// ── PUT /api/general-info ─────────────────────────────────────────────────────

openApiApp.openapi(
  createRoute({
    method: "put",
    path: "/api/general-info",
    tags: ["General Info"],
    summary: "Upsert profile info",
    description:
      "Creates or updates the current user's profile. Email is intentionally excluded — " +
      "changing email requires a separate verification flow via Better Auth.",
    security: cookieSecurity,
    request: {
      body: {
        description: "All fields are optional — send only the ones you want to change.",
        required: true,
        content: { "application/json": { schema: createGeneralInfoSchema } },
      },
    },
    responses: {
      200: {
        description: "Updated profile info",
        content: {
          "application/json": {
            schema: z.object({ generalInfo: GeneralInfoItemSchema }),
          },
        },
      },
      400: {
        description: "Validation error",
        content: { "application/json": { schema: ValidationErrorSchema } },
      },
      401: {
        description: "Not authenticated",
        content: { "application/json": { schema: UnauthorizedSchema } },
      },
    },
  }),
  (c) => c.json({ generalInfo: {} as any }, 200)
);

// ── GET /api/education ────────────────────────────────────────────────────────

openApiApp.openapi(
  createRoute({
    method: "get",
    path: "/api/education",
    tags: ["Education"],
    summary: "List education entries",
    description:
      "Returns all education records for the authenticated user, ordered by start year descending.",
    security: cookieSecurity,
    responses: {
      200: {
        description: "List of education entries",
        content: {
          "application/json": {
            schema: z.object({ education: z.array(EducationItemSchema) }),
          },
        },
      },
      401: {
        description: "Not authenticated",
        content: { "application/json": { schema: UnauthorizedSchema } },
      },
    },
  }),
  (c) => c.json({ education: [] }, 200)
);

// ── POST /api/education ───────────────────────────────────────────────────────

openApiApp.openapi(
  createRoute({
    method: "post",
    path: "/api/education",
    tags: ["Education"],
    summary: "Create education entry",
    description: "Creates a new education record for the current user.",
    security: cookieSecurity,
    request: {
      body: {
        required: true,
        content: { "application/json": { schema: createEducationSchema } },
      },
    },
    responses: {
      201: {
        description: "Created education entry",
        content: { "application/json": { schema: EducationItemSchema } },
      },
      400: {
        description: "Validation error",
        content: { "application/json": { schema: ValidationErrorSchema } },
      },
      401: {
        description: "Not authenticated",
        content: { "application/json": { schema: UnauthorizedSchema } },
      },
    },
  }),
  (c) => c.json({} as any, 201)
);

// ── PUT /api/education/:id ────────────────────────────────────────────────────

openApiApp.openapi(
  createRoute({
    method: "put",
    path: "/api/education/:id",
    tags: ["Education"],
    summary: "Update education entry",
    description:
      "Partially updates an existing education record that belongs to the current user.",
    security: cookieSecurity,
    request: {
      params: numericIdParam,
      body: {
        required: true,
        content: { "application/json": { schema: updateEducationSchema } },
      },
    },
    responses: {
      200: {
        description: "Updated education entry",
        content: {
          "application/json": {
            schema: z.object({ education: EducationItemSchema }),
          },
        },
      },
      400: {
        description: "Validation error",
        content: { "application/json": { schema: ValidationErrorSchema } },
      },
      401: {
        description: "Not authenticated",
        content: { "application/json": { schema: UnauthorizedSchema } },
      },
      404: {
        description: "Entry not found or does not belong to current user",
        content: { "application/json": { schema: NotFoundSchema } },
      },
    },
  }),
  (c) => c.json({ education: {} as any }, 200)
);

// ── DELETE /api/education/:id ─────────────────────────────────────────────────

openApiApp.openapi(
  createRoute({
    method: "delete",
    path: "/api/education/:id",
    tags: ["Education"],
    summary: "Delete education entry",
    description: "Permanently deletes an education record that belongs to the current user.",
    security: cookieSecurity,
    request: {
      params: numericIdParam,
    },
    responses: {
      200: {
        description: "Deleted education entry",
        content: {
          "application/json": {
            schema: z.object({ education: EducationItemSchema }),
          },
        },
      },
      401: {
        description: "Not authenticated",
        content: { "application/json": { schema: UnauthorizedSchema } },
      },
      404: {
        description: "Entry not found or does not belong to current user",
        content: { "application/json": { schema: NotFoundSchema } },
      },
    },
  }),
  (c) => c.json({ education: {} as any }, 200)
);

// ── GET /api/work-experience ──────────────────────────────────────────────────

openApiApp.openapi(
  createRoute({
    method: "get",
    path: "/api/work-experience",
    tags: ["Work Experience"],
    summary: "List work experience entries",
    description:
      "Returns all work experience records for the authenticated user, ordered by start date descending.",
    security: cookieSecurity,
    responses: {
      200: {
        description: "List of work experience entries",
        content: {
          "application/json": {
            schema: z.object({ workExperience: z.array(WorkExperienceItemSchema) }),
          },
        },
      },
      401: {
        description: "Not authenticated",
        content: { "application/json": { schema: UnauthorizedSchema } },
      },
    },
  }),
  (c) => c.json({ workExperience: [] }, 200)
);

// ── POST /api/work-experience ─────────────────────────────────────────────────

openApiApp.openapi(
  createRoute({
    method: "post",
    path: "/api/work-experience",
    tags: ["Work Experience"],
    summary: "Create work experience entry",
    description: "Creates a new work experience record for the current user.",
    security: cookieSecurity,
    request: {
      body: {
        required: true,
        content: { "application/json": { schema: createWorkExperienceSchema } },
      },
    },
    responses: {
      201: {
        description: "Created work experience entry",
        content: { "application/json": { schema: WorkExperienceItemSchema } },
      },
      400: {
        description: "Validation error",
        content: { "application/json": { schema: ValidationErrorSchema } },
      },
      401: {
        description: "Not authenticated",
        content: { "application/json": { schema: UnauthorizedSchema } },
      },
    },
  }),
  (c) => c.json({} as any, 201)
);

// ── PUT /api/work-experience/:id ──────────────────────────────────────────────

openApiApp.openapi(
  createRoute({
    method: "put",
    path: "/api/work-experience/:id",
    tags: ["Work Experience"],
    summary: "Update work experience entry",
    description:
      "Partially updates an existing work experience record that belongs to the current user.",
    security: cookieSecurity,
    request: {
      params: numericIdParam,
      body: {
        required: true,
        content: { "application/json": { schema: updateWorkExperienceSchema } },
      },
    },
    responses: {
      200: {
        description: "Updated work experience entry",
        content: {
          "application/json": {
            schema: z.object({ workExperience: WorkExperienceItemSchema }),
          },
        },
      },
      400: {
        description: "Validation error",
        content: { "application/json": { schema: ValidationErrorSchema } },
      },
      401: {
        description: "Not authenticated",
        content: { "application/json": { schema: UnauthorizedSchema } },
      },
      404: {
        description: "Entry not found or does not belong to current user",
        content: { "application/json": { schema: NotFoundSchema } },
      },
    },
  }),
  (c) => c.json({ workExperience: {} as any }, 200)
);

// ── DELETE /api/work-experience/:id ──────────────────────────────────────────

openApiApp.openapi(
  createRoute({
    method: "delete",
    path: "/api/work-experience/:id",
    tags: ["Work Experience"],
    summary: "Delete work experience entry",
    description: "Permanently deletes a work experience record that belongs to the current user.",
    security: cookieSecurity,
    request: {
      params: numericIdParam,
    },
    responses: {
      200: {
        description: "Deleted work experience entry",
        content: {
          "application/json": {
            schema: z.object({ workExperience: WorkExperienceItemSchema }),
          },
        },
      },
      401: {
        description: "Not authenticated",
        content: { "application/json": { schema: UnauthorizedSchema } },
      },
      404: {
        description: "Entry not found or does not belong to current user",
        content: { "application/json": { schema: NotFoundSchema } },
      },
    },
  }),
  (c) => c.json({ workExperience: {} as any }, 200)
);

// ── OpenAPI JSON spec ─────────────────────────────────────────────────────────

openApiApp.doc31("/api/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Resume Builder API",
    version: "1.0.0",
    description:
      "REST API for managing resume data — general profile info, education entries, " +
      "and work experience.\n\n" +
      "**Authentication**: All protected endpoints require an active Better Auth session " +
      "cookie (`better-auth.session_token`). Obtain one via `POST /api/auth/sign-in/email` " +
      "or Google OAuth, then use `POST /api/auth/refresh` to rotate it before expiry.",
  },
  servers: [{ url: "http://localhost:5173", description: "Local development" }],
  tags: [
    { name: "Auth", description: "Session management and token refresh" },
    { name: "General Info", description: "User profile — name, contact details, bio" },
    { name: "Education", description: "Academic history entries" },
    { name: "Work Experience", description: "Professional history entries" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "better-auth.session_token",
        description:
          "HttpOnly session cookie issued by Better Auth on sign-in. " +
          "Rotate it with POST /api/auth/refresh before it expires.",
      },
    },
  },
});

// ── Scalar API Reference UI ───────────────────────────────────────────────────

openApiApp.get(
  "/api/docs",
  apiReference({
    theme: "saturn",
    spec: { url: "/api/openapi.json" },
    pageTitle: "Resume Builder — API Reference",
    metaData: {
      title: "Resume Builder API Reference",
      description: "Interactive OpenAPI documentation for the Resume Builder backend.",
      ogDescription:
        "Explore and test all Resume Builder API endpoints with live request examples.",
    },
    defaultHttpClient: {
      targetKey: "javascript",
      clientKey: "fetch",
    },
    darkMode: true,
  })
);
