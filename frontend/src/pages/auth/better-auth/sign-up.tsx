import { CONFIG } from 'src/global-config';

import { BetterAuthSignUpView } from 'src/auth/view/better-auth';

// ----------------------------------------------------------------------

const metadata = { title: `Sign up - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <BetterAuthSignUpView />
    </>
  );
}
