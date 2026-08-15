import { api } from 'src/lib/api';
import { signIn, authClient, signUp as authSignUp, signOut as authSignOut } from 'src/lib/auth-client';

export type SignInParams = {
  email: string;
  password: string;
};

export type SignUpParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

/** **************************************
 * Sign in (Email & Password)
 *************************************** */
export const signInWithPassword = async ({ email, password }: SignInParams): Promise<void> => {
  const { error } = await signIn.email({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message || 'Failed to sign in');
  }
};

/** **************************************
 * Sign in (Google)
 *************************************** */
export const signInWithGoogle = async (): Promise<void> => {
  const { error } = await signIn.social({
    provider: 'google',
    callbackURL: window.location.origin + '/dashboard',
  });

  if (error) {
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({ email, password, firstName, lastName }: SignUpParams): Promise<any> => {
  const { data, error } = await authSignUp.email({
    email,
    password,
    name: `${firstName} ${lastName}`,
  });

  if (error) {
    throw new Error(error.message || 'Failed to sign up');
  }

  return data;
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  // Revoke the refresh token in the DB before clearing the session cookie.
  await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/revoke-refresh-token`, {
    method: 'POST',
    credentials: 'include',
  }).catch(() => {
    // Non-fatal — proceed with sign-out even if this fails
  });

  const { error } = await authSignOut();

  if (error) {
    throw new Error(error.message || 'Failed to sign out');
  }
};

/** **************************************
 * Forgot password
 *************************************** */
export const forgotPassword = async (email: string, redirectTo?: string): Promise<void> => {
  // Pre-check: verify the email exists so we can show a clear error instead of
  // silently succeeding (better-auth returns 200 even for unknown emails).
  const checkRes = await api['check-email'].$post({ json: { email } });
  const checkData = await checkRes.json();

  if (!checkData.exists) {
    throw new Error('No account found with this email address.');
  }

  const { error } = await authClient.$fetch('/request-password-reset', {
    method: 'POST',
    body: { email, redirectTo },
  });

  if (error) {
    throw new Error((error as any).message || 'Failed to send password reset email');
  }
};

/** **************************************
 * Reset password
 *************************************** */
export const resetPassword = async (password: string, token: string): Promise<void> => {
  const { error } = await authClient.$fetch('/reset-password', {
    method: 'POST',
    body: { newPassword: password, token },
  });

  if (error) {
    throw new Error((error as any).message || 'Failed to reset password');
  }

  // Sign out any session that better-auth may have auto-created after the reset,
  // so the user is redirected to the login page and must sign in explicitly.
  try {
    await authSignOut();
  } catch (_) {
    // Non-fatal — proceed to login redirect regardless
  }
};
