import { useMemo } from 'react';

import { useSession } from 'src/lib/auth-client';

import { AuthContext } from '../auth-context';

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const { data, isPending } = useSession();

  const user = data?.user || null;

  const authenticated = !!user;
  const unauthenticated = !user;
  const loading = isPending;

  const checkUserSession = async () => {
    // With better-auth we rely on useSession auto-updating, but we can provide this 
    // as a no-op to satisfy the context type if it's called imperatively by some components.
  };

  const memoizedValue = useMemo(
    () => ({
      user: user ? { ...user, role: 'admin' } : null,
      checkUserSession,
      loading,
      authenticated,
      unauthenticated,
    }),
    [user, loading, authenticated, unauthenticated]
  );

  return <AuthContext value={memoizedValue}>{children}</AuthContext>;
}
