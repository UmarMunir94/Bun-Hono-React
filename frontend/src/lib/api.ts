import { hc } from "hono/client";
import { type ApiRoutes } from "@server/app";
import { queryOptions } from "@tanstack/react-query";
import { type CreateExpense, type CreateEducation, type CreateWorkExperience } from "@server/sharedTypes";

const client = hc<ApiRoutes>(import.meta.env.VITE_SERVER_URL);

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

export async function getAllExpenses() {
  const res = await api.expenses.$get();
  if (!res.ok) {
    throw new Error("server error");
  }
  const data = await res.json();
  return data;
}
export const getAllExpensesQueryOptions = queryOptions({
  queryKey: ["get-all-expenses"],
  queryFn: getAllExpenses,
  staleTime: 1000 * 60 * 5,
});

export async function createExpense({ value }: { value: CreateExpense }) {
  const res = await api.expenses.$post({ json: value });
  if (!res.ok) {
    throw new Error("server error");
  }

  const newExpense = await res.json();
  return newExpense;
}

export const loadingCreateExpenseQueryOptions = queryOptions<{
  expense?: CreateExpense;
}>({
  queryKey: ["loading-create-expense"],
  queryFn: async () => ({}),
  staleTime: Infinity,
});

export async function deleteExpense({ id }: { id: number }) {
  const res = await api.expenses[":id{[0-9]+}"].$delete({
    param: { id: id.toString() },
  });

  if (!res.ok) {
    throw new Error("server error");
  }
}

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
