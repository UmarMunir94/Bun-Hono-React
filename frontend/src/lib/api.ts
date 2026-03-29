import { hc } from "hono/client";
import { type ApiRoutes } from "@server/app";
import { queryOptions } from "@tanstack/react-query";
import { type CreateExpense, type CreateEducation } from "@server/sharedTypes";

const client = hc<ApiRoutes>("/");

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
  queryFn: async () => {
    return {};
  },
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
