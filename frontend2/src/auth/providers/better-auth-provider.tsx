import { PropsWithChildren, useEffect, useState } from 'react';
import { BetterAuthAdapter } from '@/auth/adapters/better-auth-adapter';
import { AuthContext } from '@/auth/context/auth-context';
import * as authHelper from '@/auth/lib/helpers';
import { AuthModel, UserModel } from '@/auth/lib/models';

/**
 * Auth provider backed by Better Auth.
 * Replaces the previous Supabase-based provider while keeping the same AuthContext interface.
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(currentUser?.is_admin === true);
  }, [currentUser]);

  const saveAuth = (auth: AuthModel | undefined) => {
    setAuth(auth);
    if (auth) {
      authHelper.setAuth(auth);
    } else {
      authHelper.removeAuth();
    }
  };

  const verify = async () => {
    if (auth) {
      try {
        const user = await getUser();
        setCurrentUser(user ?? undefined);
      } catch {
        saveAuth(undefined);
        setCurrentUser(undefined);
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const authData = await BetterAuthAdapter.login(email, password);
      saveAuth(authData);
      const user = await getUser();
      setCurrentUser(user ?? undefined);
    } catch (error) {
      saveAuth(undefined);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    password_confirmation: string,
    firstName?: string,
    lastName?: string,
  ) => {
    try {
      const authData = await BetterAuthAdapter.register(
        email,
        password,
        password_confirmation,
        firstName,
        lastName,
      );
      saveAuth(authData);
      const user = await getUser();
      setCurrentUser(user ?? undefined);
    } catch (error) {
      saveAuth(undefined);
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    await BetterAuthAdapter.requestPasswordReset(email);
  };

  const resetPassword = async (password: string, password_confirmation: string) => {
    await BetterAuthAdapter.resetPassword(password, password_confirmation);
  };

  const resendVerificationEmail = async (email: string) => {
    await BetterAuthAdapter.resendVerificationEmail(email);
  };

  const getUser = async () => {
    return await BetterAuthAdapter.getCurrentUser();
  };

  const updateProfile = async (userData: Partial<UserModel>) => {
    return await BetterAuthAdapter.updateUserProfile(userData);
  };

  const logout = () => {
    BetterAuthAdapter.logout();
    saveAuth(undefined);
    setCurrentUser(undefined);
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        auth,
        saveAuth,
        user: currentUser,
        setUser: setCurrentUser,
        login,
        register,
        requestPasswordReset,
        resetPassword,
        resendVerificationEmail,
        getUser,
        updateProfile,
        logout,
        verify,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
