import { CONFIG } from 'src/global-config';

import { EducationEditView } from 'src/sections/education/view';

// ----------------------------------------------------------------------

const metadata = { title: `Edit education | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <EducationEditView />
    </>
  );
}
