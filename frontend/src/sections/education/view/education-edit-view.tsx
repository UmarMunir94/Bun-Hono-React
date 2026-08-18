import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { getAllEducationQueryOptions } from 'src/lib/api';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { EducationCreateEditForm } from '../education-create-edit-form';

// ----------------------------------------------------------------------

export function EducationEditView() {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);

  const { data, isLoading } = useQuery(getAllEducationQueryOptions);

  const currentData = data?.education?.find((item) => item.id === numericId);

  if (isLoading) {
    return (
      <DashboardContent>
        <Typography>Loading...</Typography>
      </DashboardContent>
    );
  }

  if (!currentData) {
    return (
      <DashboardContent>
        <Typography color="error">Education record not found.</Typography>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit education"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Education', href: paths.dashboard.education.root },
          { name: currentData.institution },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <EducationCreateEditForm currentData={currentData} />
    </DashboardContent>
  );
}
