import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { BetterAuthVerifyEmailView } from 'src/auth/view/better-auth';

// ----------------------------------------------------------------------

const metadata = { title: `Verify Email - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <BetterAuthVerifyEmailView />
    </>
  );
}
