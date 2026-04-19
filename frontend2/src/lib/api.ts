import { hc } from "hono/client";
import { type ApiRoutes } from "@server/app";
import { queryOptions } from "@tanstack/react-query";
import {
  type CreateEducation,
  type CreateWorkExperience,
  type UpdateEducation,
  type UpdateWorkExperience,
  type Education,
  type WorkExperience,
} from "@server/sharedTypes";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function attemptSilentRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
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

async function fetchWithRefresh(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const baseInit = { ...init, credentials: "include" as RequestCredentials };
  const response = await fetch(input, baseInit);

  if (response.status !== 401) return response;

  const refreshed = await attemptSilentRefresh();

  if (!refreshed) {
    window.location.href = "/auth/signin";
    return response;
  }

  return fetch(input, baseInit);
}

const client = hc<ApiRoutes>(import.meta.env.VITE_SERVER_URL, {
  fetch: fetchWithRefresh,
});

export const api = client.api;

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
  // Cast to Education to provide proper types to callers
  return (await res.json()) as Education;
}

export async function updateEducation({
  id,
  value,
}: {
  id: number;
  value: UpdateEducation;
}) {
  const res = await api.education[":id{[0-9]+}"].$put({
    param: { id: id.toString() },
    json: value,
  });
  if (!res.ok) throw new Error("server error");
  // Keep the wrap as in backend response, but typed properly
  return (await res.json()) as { education: Education };
}

export async function deleteEducation({ id }: { id: number }) {
  const res = await api.education[":id{[0-9]+}"].$delete({
    param: { id: id.toString() },
  });
  if (!res.ok) throw new Error("server error");
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
  // Cast to WorkExperience to provide proper types to callers
  return (await res.json()) as WorkExperience;
}

export async function updateWorkExperience({
  id,
  value,
}: {
  id: number;
  value: UpdateWorkExperience;
}) {
  const res = await api["work-experience"][":id{[0-9]+}"].$put({
    param: { id: id.toString() },
    json: value,
  });
  if (!res.ok) throw new Error("server error");
  // Keep the wrap as in backend response, but typed properly
  return (await res.json()) as { workExperience: WorkExperience };
}

export async function deleteWorkExperience({ id }: { id: number }) {
  const res = await api["work-experience"][":id{[0-9]+}"].$delete({
    param: { id: id.toString() },
  });
  if (!res.ok) throw new Error("server error");
}
