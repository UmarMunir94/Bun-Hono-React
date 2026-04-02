import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ScreenLoader } from '@/components/common/screen-loader';
import { useSession } from '@/lib/auth-client';

/**
 * Component to protect routes that require authentication.
 * If user is not authenticated, redirects to the login page.
 */
export const RequireAuth = () => {
  const { data: session, isPending } = useSession();
  const location = useLocation();

  // Show screen loader while checking authentication
  if (isPending) {
    return <ScreenLoader />;
  }

  // If not authenticated, redirect to login
  if (!session) {
    return (
      <Navigate
        to={`/auth/signin?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // If authenticated, render child routes
  return <Outlet />;
};
