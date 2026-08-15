import { CONFIG } from 'src/global-config';

import { BetterAuthResetPasswordView } from 'src/auth/view/better-auth/reset-password-view';

// ----------------------------------------------------------------------

const metadata = { title: `Reset Password - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <BetterAuthResetPasswordView />
    </>
  );
}
