import { CONFIG } from 'src/global-config';

import { EducationListView } from 'src/sections/education/view';

// ----------------------------------------------------------------------

const metadata = { title: `Education list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <EducationListView />
    </>
  );
}
