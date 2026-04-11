import { signIn, signUp as authSignUp, signOut as authSignOut } from 'src/lib/auth-client';

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
export const signUp = async ({ email, password, firstName, lastName }: SignUpParams): Promise<void> => {
  const { error } = await authSignUp.email({
    email,
    password,
    name: `${firstName} ${lastName}`,
  });

  if (error) {
    throw new Error(error.message || 'Failed to sign up');
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  const { error } = await authSignOut();

  if (error) {
    throw new Error(error.message || 'Failed to sign out');
  }
};
