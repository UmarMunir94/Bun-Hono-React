import { CONFIG } from 'src/global-config';

import { EducationCreateView } from 'src/sections/education/view';

// ----------------------------------------------------------------------

const metadata = { title: `Create education | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <EducationCreateView />
    </>
  );
}
