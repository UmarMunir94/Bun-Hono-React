# API Reference & Documentation Guide

## All API Endpoints

### 🔐 Auth Routes (`/api/auth/*` — managed by Better Auth)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/sign-up/email` | Register with email + password |
| `POST` | `/api/auth/sign-in/email` | Sign in with email + password |
| `POST` | `/api/auth/sign-in/social` | OAuth (Google) sign-in |
| `GET`  | `/api/auth/get-session` | Get current session |
| `POST` | `/api/auth/sign-out` | Sign out |
| `POST` | `/api/auth/refresh` | Refresh access session using refresh_token cookie |

---

### 👤 User Route

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/me` | ✅ | Get current authenticated user's Better Auth profile |

---

### 📋 General Info Routes (`/api/general-info`)

| Method | Path | Auth | Description | Body Schema |
|--------|------|------|-------------|-------------|
| `GET` | `/api/general-info` | ✅ | Get current user's profile info (merged with email from user table) | — |
| `PUT` | `/api/general-info` | ✅ | Upsert profile info (creates or updates) | `createGeneralInfoSchema` |

**GET Response shape:**
```json
{
  "generalInfo": {
    "id": "uuid",
    "userId": "string",
    "firstName": "string | null",
    "lastName": "string | null",
    "phone": "string | null",
    "city": "string | null",
    "country": "string | null",
    "linkedinProfile": "string | null",
    "avatarUrl": "string | null",
    "address": "string | null",
    "state": "string | null",
    "zipCode": "string | null",
    "about": "string | null",
    "createdAt": "string",
    "email": "string | null"
  }
}
```

**PUT Request body** (all fields optional):
```json
{
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "city": "string",
  "country": "string",
  "linkedinProfile": "string",
  "avatarUrl": "string",
  "address": "string",
  "state": "string",
  "zipCode": "string",
  "about": "string"
}
```

---

### 🎓 Education Routes (`/api/education`)

| Method | Path | Auth | Description | Body Schema |
|--------|------|------|-------------|-------------|
| `GET` | `/api/education` | ✅ | List all education entries for current user | — |
| `POST` | `/api/education` | ✅ | Create a new education entry | `createEducationSchema` |
| `PUT` | `/api/education/:id` | ✅ | Update an education entry | `updateEducationSchema` |
| `DELETE` | `/api/education/:id` | ✅ | Delete an education entry | — |

**POST/PUT body:**
```json
{
  "institution": "string (min 2)",
  "degree": "string (min 2)",
  "fieldOfStudy": "string (min 2)",
  "startYear": "number (1900–2100)",
  "endYear": "number | null",
  "description": "string | null"
}
```

---

### 💼 Work Experience Routes (`/api/work-experience`)

| Method | Path | Auth | Description | Body Schema |
|--------|------|------|-------------|-------------|
| `GET` | `/api/work-experience` | ✅ | List all work experience entries for current user | — |
| `POST` | `/api/work-experience` | ✅ | Create a new work experience entry | `createWorkExperienceSchema` |
| `PUT` | `/api/work-experience/:id` | ✅ | Update a work experience entry | `updateWorkExperienceSchema` |
| `DELETE` | `/api/work-experience/:id` | ✅ | Delete a work experience entry | — |

**POST/PUT body:**
```json
{
  "company": "string (min 2)",
  "location": "string (min 2)",
  "position": "string (min 2)",
  "startDate": "string (YYYY-MM-DD)",
  "endDate": "string (YYYY-MM-DD) | null",
  "description": "string | null"
}
```

---

## Building Interactive API Documentation

### Option 1: Scalar (Recommended — Modern, Beautiful)

**[Scalar](https://scalar.com)** is a modern, open-source API reference UI. It integrates natively with Hono.

**Step 1 — Install packages:**
```bash
cd backend
bun add @scalar/hono-api-reference @hono/zod-openapi
```

**Step 2 — Create an OpenAPI-typed app (`server/openapi-app.ts`):**
```ts
import { OpenAPIHono } from '@hono/zod-openapi'
// Replace your route definitions to use createRoute() from @hono/zod-openapi
// This auto-generates the OpenAPI spec from your Zod validators
```

**Step 3 — Mount Scalar in `app.ts`:**
```ts
import { apiReference } from '@scalar/hono-api-reference'

app.get('/api/docs', apiReference({
  theme: 'saturn',
  spec: { url: '/api/openapi.json' },
}))
```

**Access at:** `http://localhost:3000/api/docs`

---

### Option 2: Swagger UI (Simpler, Works with Hono Swagger)

```bash
bun add @hono/swagger-ui
```

```ts
import { swaggerUI } from '@hono/swagger-ui'
app.get('/api/docs', swaggerUI({ url: '/api/openapi.json' }))
```

---

### Option 3: Hoppscotch / Postman Collection (No Code Required)

Since all routes use Hono RPC types, you can export a Postman Collection manually from the endpoint table above. Each route is fully validated by Zod so the body schemas above are the authoritative spec.

---

> [!TIP]
> Since this project already uses `drizzle-zod` + `@hono/zod-validator`, migrating to `@hono/zod-openapi` to get auto-generated docs is straightforward — the Zod schemas are already defined. You'd mainly just need to wrap your routes in `createRoute()` and add response schemas.
