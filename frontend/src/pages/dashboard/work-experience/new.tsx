import { CONFIG } from 'src/global-config';

import { WorkExperienceCreateView } from 'src/sections/work-experience/view';

// ----------------------------------------------------------------------

const metadata = { title: `Create work experience | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <WorkExperienceCreateView />
    </>
  );
}
