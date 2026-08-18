import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { getAllWorkExperienceQueryOptions } from 'src/lib/api';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { WorkExperienceCreateEditForm } from '../work-experience-create-edit-form';

// ----------------------------------------------------------------------

export function WorkExperienceEditView() {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);

  const { data, isLoading } = useQuery(getAllWorkExperienceQueryOptions);

  const currentData = data?.workExperience?.find((item) => item.id === numericId);

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
        <Typography color="error">Work experience record not found.</Typography>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit work experience"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Work Experience', href: paths.dashboard.workExperience.root },
          { name: `${currentData.position} at ${currentData.company}` },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <WorkExperienceCreateEditForm currentData={currentData} />
    </DashboardContent>
  );
}
