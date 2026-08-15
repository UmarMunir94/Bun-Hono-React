import { CONFIG } from 'src/global-config';

import { BetterAuthForgotPasswordView } from 'src/auth/view/better-auth/forgot-password-view';

// ----------------------------------------------------------------------

const metadata = { title: `Forgot Password - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <BetterAuthForgotPasswordView />
    </>
  );
}
