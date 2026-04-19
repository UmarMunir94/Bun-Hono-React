import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { EducationCreateEditForm } from '../education-create-edit-form';

// ----------------------------------------------------------------------

export function EducationCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create new education"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Education', href: paths.dashboard.education.root },
          { name: 'Create' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <EducationCreateEditForm />
    </DashboardContent>
  );
}
