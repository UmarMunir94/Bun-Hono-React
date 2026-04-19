import { CONFIG } from 'src/global-config';

import { BetterAuthSignInView } from 'src/auth/view/better-auth';

// ----------------------------------------------------------------------

const metadata = { title: `Sign in - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <BetterAuthSignInView />
    </>
  );
}
