import { useQuery } from '@tanstack/react-query';

import { userQueryOptions } from 'src/lib/api';

// ----------------------------------------------------------------------
// Fetches the authenticated user from the /api/me endpoint via TanStack Query.
// Fields are mapped from the backend shape to the shape components expect:
//   name  → displayName
//   image → photoURL
// ----------------------------------------------------------------------

export function useUser() {
  const { data } = useQuery(userQueryOptions);

  const apiUser = data?.user ?? null;

  const user: Record<string, any> | null = apiUser
    ? {
        ...apiUser,
        displayName: apiUser.name,
        photoURL: apiUser.image ?? undefined,
        role: 'admin',
      }
    : null;

  return { user };
}
