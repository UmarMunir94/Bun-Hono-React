import { hc } from "hono/client";
import { type ApiRoutes } from "@server/app";
import { queryOptions } from "@tanstack/react-query";
import { type CreateEducation, type CreateWorkExperience, type UpdateEducation, type UpdateWorkExperience } from "@server/sharedTypes";

// ─── Silent refresh interceptor ──────────────────────────────────────────────
// When any API call returns 401, try to silently refresh the session using the
// refresh_token cookie before giving up. If the refresh also fails, redirect to
// the sign-in page so the user can log back in.

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function attemptSilentRefresh(): Promise<boolean> {
  // Deduplicate concurrent refresh attempts
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/refresh`,
        {
          method: "POST",
          credentials: "include", // send & receive httpOnly cookies
        }
      );
      return res.ok;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * fetch wrapper used by the Hono RPC client.
 * - Sends credentials (cookies) on every request.
 * - On 401: tries to refresh the session once, then retries.
 * - On repeated 401 after refresh: redirects to /sign-in.
 */
async function fetchWithRefresh(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const baseInit = { ...init, credentials: "include" as RequestCredentials };
  const response = await fetch(input, baseInit);

  if (response.status !== 401) return response;

  // Attempt silent refresh
  const refreshed = await attemptSilentRefresh();

  if (!refreshed) {
    // Refresh token is also expired — force re-login
    window.location.href = "/sign-in";
    return response;
  }

  // Retry the original request once with the new session cookie
  return fetch(input, baseInit);
}

// ─── Hono RPC client ─────────────────────────────────────────────────────────
const client = hc<ApiRoutes>(import.meta.env.VITE_SERVER_URL, {
  fetch: fetchWithRefresh,
});

export const api = client.api;

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function getCurrentUser() {
  const res = await api.me.$get();
  if (!res.ok) {
    throw new Error("server error");
  }
  const data = await res.json();
  return data;
}

export const userQueryOptions = queryOptions({
  queryKey: ["get-current-user"],
  queryFn: getCurrentUser,
  staleTime: Infinity,
});

// ── Education ──────────────────────────────────────────────────────────────

export async function getAllEducation() {
  const res = await api.education.$get();
  if (!res.ok) throw new Error("server error");
  return res.json();
}

export const getAllEducationQueryOptions = queryOptions({
  queryKey: ["get-all-education"],
  queryFn: getAllEducation,
  staleTime: 1000 * 60 * 5,
});

export const loadingCreateEducationQueryOptions = queryOptions<{
  education?: CreateEducation;
}>({
  queryKey: ["loading-create-education"],
  queryFn: async () => ({}),
  staleTime: Infinity,
});

export async function createEducation({ value }: { value: CreateEducation }) {
  const res = await api.education.$post({ json: value });
  if (!res.ok) throw new Error("server error");
  return res.json();
}

export async function deleteEducation({ id }: { id: number }) {
  const res = await api.education[":id{[0-9]+}"].$delete({
    param: { id: id.toString() },
  });
  if (!res.ok) throw new Error("server error");
}

export async function updateEducation({ id, value }: { id: number; value: UpdateEducation }) {
  const res = await api.education[":id{[0-9]+}"].$put({
    param: { id: id.toString() },
    json: value,
  });
  if (!res.ok) throw new Error("server error");
  return res.json();
}

// ── Work Experience ────────────────────────────────────────────────────────

export async function getAllWorkExperience() {
  const res = await api["work-experience"].$get();
  if (!res.ok) throw new Error("server error");
  return res.json();
}

export const getAllWorkExperienceQueryOptions = queryOptions({
  queryKey: ["get-all-work-experience"],
  queryFn: getAllWorkExperience,
  staleTime: 1000 * 60 * 5,
});

export const loadingCreateWorkExperienceQueryOptions = queryOptions<{
  workExperience?: CreateWorkExperience;
}>({
  queryKey: ["loading-create-work-experience"],
  queryFn: async () => ({}),
  staleTime: Infinity,
});

export async function createWorkExperience({
  value,
}: {
  value: CreateWorkExperience;
}) {
  const res = await api["work-experience"].$post({ json: value });
  if (!res.ok) throw new Error("server error");
  return res.json();
}

export async function deleteWorkExperience({ id }: { id: number }) {
  const res = await api["work-experience"][":id{[0-9]+}"].$delete({
    param: { id: id.toString() },
  });
  if (!res.ok) throw new Error("server error");
}

export async function updateWorkExperience({ id, value }: { id: number; value: UpdateWorkExperience }) {
  const res = await api["work-experience"][":id{[0-9]+}"].$put({
    param: { id: id.toString() },
    json: value,
  });
  if (!res.ok) throw new Error("server error");
  return res.json();
}
