import { CONFIG } from 'src/global-config';

import { WorkExperienceEditView } from 'src/sections/work-experience/view';

// ----------------------------------------------------------------------

const metadata = { title: `Edit work experience | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <WorkExperienceEditView />
    </>
  );
}
