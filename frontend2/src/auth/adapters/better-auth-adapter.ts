import { AuthModel, UserModel } from '@/auth/lib/models';
import { authClient } from '@/lib/auth-client';

/**
 * Better Auth adapter that maintains the same interface as the previous supabase adapter
 * but uses Better Auth under the hood.
 */
export const BetterAuthAdapter = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthModel> {
    const res = await authClient.signIn.email({ email, password });

    if (res.error) {
      throw new Error(res.error.message ?? 'Login failed');
    }

    return {
      access_token: res.data?.token ?? '',
    };
  },

  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    password_confirmation: string,
    firstName?: string,
    lastName?: string,
  ): Promise<AuthModel> {
    if (password !== password_confirmation) {
      throw new Error('Passwords do not match');
    }

    const name = [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0];

    const res = await authClient.signUp.email({ email, password, name });

    if (res.error) {
      throw new Error(res.error.message ?? 'Registration failed');
    }

    return {
      access_token: res.data?.token ?? '',
    };
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const res = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/auth/change-password`,
    });

    if (res.error) {
      throw new Error(res.error.message ?? 'Password reset request failed');
    }
  },

  /**
   * Reset password with new password (token is read from URL by better-auth)
   */
  async resetPassword(password: string, password_confirmation: string): Promise<void> {
    if (password !== password_confirmation) {
      throw new Error('Passwords do not match');
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') ?? '';

    const res = await authClient.resetPassword({ newPassword: password, token });

    if (res.error) {
      throw new Error(res.error.message ?? 'Password reset failed');
    }
  },

  /**
   * Get current user from the active session
   */
  async getCurrentUser(): Promise<UserModel | null> {
    const res = await authClient.getSession();

    if (res.error || !res.data?.user) return null;

    return this.mapToUserModel(res.data.user);
  },

  /**
   * Update user profile
   */
  async updateUserProfile(userData: Partial<UserModel>): Promise<UserModel> {
    const name = userData.fullname
      ?? [userData.first_name, userData.last_name].filter(Boolean).join(' ')
      ?? undefined;

    const res = await authClient.updateUser({ name, image: userData.pic });

    if (res.error) {
      throw new Error(res.error.message ?? 'Profile update failed');
    }

    const user = await this.getCurrentUser();
    if (!user) throw new Error('Failed to retrieve updated user');
    return user;
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    const res = await authClient.signOut();
    if (res.error) {
      throw new Error(res.error.message ?? 'Logout failed');
    }
  },

  /**
   * Resend verification email (no-op stub — better-auth handles this server-side)
   */
  async resendVerificationEmail(_email: string): Promise<void> {
    // Better Auth does not expose a client-side resend API by default.
    // Implement server-side trigger if needed.
  },

  /**
   * Check if the adapter is available / the server is reachable
   */
  async isAvailable(): Promise<boolean> {
    try {
      const res = await authClient.getSession();
      return !res.error;
    } catch {
      return false;
    }
  },

  // ─── private helpers ───────────────────────────────────────────────────────

  mapToUserModel(
    user: NonNullable<Awaited<ReturnType<typeof authClient.getSession>>['data']>['user'],
  ): UserModel {
    const nameParts = (user.name ?? '').split(' ');
    const first_name = nameParts[0] ?? '';
    const last_name = nameParts.slice(1).join(' ') ?? '';

    return {
      id: user.id,
      email: user.email ?? '',
      email_verified: user.emailVerified ?? false,
      username: user.email?.split('@')[0] ?? '',
      first_name,
      last_name,
      fullname: user.name ?? '',
      pic: user.image ?? '',
      occupation: '',
      company_name: '',
      companyName: '',
      phone: '',
      roles: [],
      language: 'en',
      is_admin: false,
    } as UserModel;
  },
};
