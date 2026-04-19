import { useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useSession } from '@/lib/auth-client';

/**
 * Callback page for OAuth authentication redirects.
 * Better Auth handles the token exchange server-side; this page simply
 * waits for the session to be established and then redirects.
 */
export function CallbackPage() {
  const search = useSearch({ from: '/auth/callback' });
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    // If there's an error param from the OAuth provider, redirect to sign-in
    const errorParam = search.error;
    const errorDescription = search.error_description;

    if (errorParam) {
      navigate({
        to: `/auth/signin`,
        search: {
          error: errorParam,
          error_description: errorDescription ?? 'Authentication failed',
        },
        replace: true,
      });
      return;
    }

    // Once the session is resolved (either authenticated or not), redirect
    if (!isPending) {
      if (session) {
        const nextPath = search.next ?? '/';
        navigate({ to: nextPath, replace: true });
      } else {
        navigate({
          to: '/auth/signin',
          search: { error: 'auth_callback_failed' },
          replace: true,
        });
      }
    }
  }, [session, isPending, navigate, search]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <p className="text-muted-foreground">Completing sign-in, please wait…</p>
    </div>
  );
}

