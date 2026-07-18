# Single-App OpenAPIHono Migration

## Goal
Convert the backend to a proper single-source-of-truth `OpenAPIHono` app where routes are defined once via `createRoute()` — both the actual handler logic AND the OpenAPI spec come from the same place. Eliminates `openapi.ts` (the stub parallel app).

## Critical Constraint: Frontend `hc` Client

> [!IMPORTANT]
> The frontend uses `api.education[":id{[0-9]+}"].$delete(...)` — the Hono **regex path syntax**.
> If route paths change from `/:id{[0-9]+}` → `/:id`, the `ApiRoutes` type changes and **the frontend breaks**.
>
> **Fix**: Keep `/:id{[0-9]+}` in all `createRoute()` path declarations. OpenAPI will render it as `/:id` in the spec (the regex constraint is a Hono-only concept).

## Architecture: `extendZodWithOpenApi` Initialization Order

A critical challenge with ESM: `extendZodWithOpenApi(z)` must run before any `.openapi()` call on a Zod schema, but static `import` statements are hoisted.

**Solution**: `server/setup.ts` — a side-effect-only module imported as the **first line** of `server/index.ts`. ESM evaluates imports in declaration order (depth-first), so `setup.ts` is guaranteed to run before `app.ts` and its transitive dependencies.

## Proposed Changes

### Infrastructure (New Files)

#### [NEW] server/setup.ts
Calls `extendZodWithOpenApi(z)` once. Imported first in `index.ts`.

#### [NEW] server/lib/openapi-schemas.ts
Shared response schemas used across all route files:
- `UnauthorizedSchema` (`"Unauthorized"` ref)
- `NotFoundSchema` (`"NotFound"` ref)
- `ValidationErrorSchema` (`"ValidationError"` ref)
- `UserSchema` (`"User"` ref)
- `cookieSecurity` constant
- `defaultHook` — shared validation error handler for all `OpenAPIHono` instances

---

### Modified Files

#### [MODIFY] server/index.ts
Add `import "./setup"` as the **first import statement** (before `import app from "./app"`).

---

#### [MODIFY] server/app.ts
- `new Hono` → `new OpenAPIHono<{ Variables: AppVariables }>`
- Extract API routes into a dedicated `apiApp = new OpenAPIHono()` instance (preserves `basePath("/api")` semantics)
- Convert `/me` inline handler → `createRoute()` + `.openapi()`
- Call `apiApp.doc31("/openapi.json", { servers: [{ url: ".../api" }] })` — spec accessible at `/api/openapi.json`
- Mount Scalar: `apiApp.get("/docs", apiReference(...))`
- Remove `openApiApp` import (deleting `openapi.ts`)
- `export type ApiRoutes = typeof apiApp` — same semantic shape as before for the `hc` client

---

#### [MODIFY] server/routes/education.ts
- `new Hono` → `new OpenAPIHono<{ Variables: ... }>({ defaultHook })`
- Define `EducationItemSchema` response schema (local to this file)
- 4 `createRoute()` declarations: `listEducation`, `postEducation`, `updateEducation`, `deleteEducation`
- Replace `.get()/.post()/.put()/.delete()` with `.openapi(route, handler)`
- Remove `zValidator` (validation is done automatically by `OpenAPIHono.openapi()`)
- Keep `/:id{[0-9]+}` path to preserve `hc` client compatibility

#### [MODIFY] server/routes/work-experience.ts
Same pattern as education.

#### [MODIFY] server/routes/general-info.ts
Same pattern — 2 routes (GET + PUT).

#### [MODIFY] server/routes/refresh.ts
Convert `refreshRoute` from `new Hono()` → `new OpenAPIHono()`. 2 `createRoute()` declarations for the refresh/revoke endpoints. All helper functions (`createRefreshToken`, `setRefreshTokenCookie`, `REFRESH_TOKEN_COOKIE`) are unchanged — they don't need `OpenAPIHono`.

---

#### [DELETE] server/openapi.ts
Completely removed. The single-app approach replaces it entirely.

---

## What Each Route Handler Gains

Before (Hono, stub in openapi.ts):
```ts
// education.ts (real handler)
.post("/", getUser, zValidator("json", createEducationSchema), async (c) => { ... })

// openapi.ts (duplicate stub)
openApiApp.openapi(createRoute({ method: "post", ... }), (c) => c.json({} as any))
```

After (OpenAPIHono, single definition):
```ts
// education.ts only — no duplicate
const postEducation = createRoute({
  method: "post", path: "/", tags: ["Education"],
  middleware: [getUser],
  request: { body: { content: { "application/json": { schema: createEducationSchema } } } },
  responses: { 201: { ... }, 400: { ... }, 401: { ... } },
});

educationRoute.openapi(postEducation, async (c) => {
  const body = c.req.valid("json"); // auto-validated by OpenAPIHono
  // ... real DB logic
});
```

## Verification Plan

### Automated
```bash
bun run server/index.ts  # server starts without errors
```

### Manual
1. `GET /api/openapi.json` → 200, valid OpenAPI 3.1 spec with all 12 endpoints
2. `GET /api/docs` → 200, Scalar UI renders
3. TypeScript compiles with no errors
4. Frontend `hc` client paths unchanged (`[":id{[0-9]+}"]` still present in `ApiRoutes`)
