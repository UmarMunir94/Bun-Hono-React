import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import { getEventByIdQueryOptions } from 'src/lib/api';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { EventCreateEditForm } from 'src/sections/events/event-create-edit-form';

export default function Page() {
  const { id = '' } = useParams();

  const { data, isLoading } = useQuery(getEventByIdQueryOptions(Number(id)));

  return (
    <>
      <Helmet>
        <title> {`Edit event - ${CONFIG.appName}`}</title>
      </Helmet>

      <DashboardContent>
        <CustomBreadcrumbs
          heading="Edit event"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Events', href: paths.dashboard.events.list },
            { name: data?.event?.name },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <EventCreateEditForm currentData={data?.event} />
        )}
      </DashboardContent>
    </>
  );
}
