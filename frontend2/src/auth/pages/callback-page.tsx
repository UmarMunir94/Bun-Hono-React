import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSession } from '@/lib/auth-client';

/**
 * Callback page for OAuth authentication redirects.
 * Better Auth handles the token exchange server-side; this page simply
 * waits for the session to be established and then redirects.
 */
export function CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    // If there's an error param from the OAuth provider, redirect to sign-in
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (errorParam) {
      navigate(
        `/auth/signin?error=${errorParam}&error_description=${encodeURIComponent(
          errorDescription ?? 'Authentication failed',
        )}`,
        { replace: true },
      );
      return;
    }

    // Once the session is resolved (either authenticated or not), redirect
    if (!isPending) {
      if (session) {
        const nextPath = searchParams.get('next') ?? '/';
        navigate(nextPath, { replace: true });
      } else {
        navigate('/auth/signin?error=auth_callback_failed', { replace: true });
      }
    }
  }, [session, isPending, navigate, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <p className="text-muted-foreground">Completing sign-in, please wait…</p>
    </div>
  );
}
