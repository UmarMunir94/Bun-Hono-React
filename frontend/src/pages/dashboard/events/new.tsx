import { Helmet } from 'react-helmet-async';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { EventCreateEditForm } from 'src/sections/events/event-create-edit-form';

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Create a new event - ${CONFIG.appName}`}</title>
      </Helmet>

      <DashboardContent>
        <CustomBreadcrumbs
          heading="Create a new event"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Events', href: paths.dashboard.events.list },
            { name: 'New event' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <EventCreateEditForm />
      </DashboardContent>
    </>
  );
}
