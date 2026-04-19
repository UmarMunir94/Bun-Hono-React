import { CONFIG } from 'src/global-config';

import { WorkExperienceListView } from 'src/sections/work-experience/view';

// ----------------------------------------------------------------------

const metadata = { title: `Work Experience list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <WorkExperienceListView />
    </>
  );
}
