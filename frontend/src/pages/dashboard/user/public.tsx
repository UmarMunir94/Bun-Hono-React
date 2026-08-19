import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';

import { PublicProfileView } from 'src/sections/user/view/public-profile-view';

export default function Page() {
  const { id = '' } = useParams();

  return (
    <>
      <Helmet>
        <title> {`Public Profile - ${CONFIG.appName}`}</title>
      </Helmet>

      <PublicProfileView id={id} />
    </>
  );
}
