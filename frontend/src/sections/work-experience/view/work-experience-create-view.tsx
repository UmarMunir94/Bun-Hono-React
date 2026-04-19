import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { WorkExperienceCreateEditForm } from '../work-experience-create-edit-form';

// ----------------------------------------------------------------------

export function WorkExperienceCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create new work experience"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Work Experience', href: paths.dashboard.workExperience.root },
          { name: 'Create' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <WorkExperienceCreateEditForm />
    </DashboardContent>
  );
}
