import { useQuery } from '@tanstack/react-query';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';
import { getAllEducationQueryOptions } from 'src/lib/api';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export function EducationListView() {
  const { data: educationData, isLoading } = useQuery(getAllEducationQueryOptions);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Education List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Education', href: paths.dashboard.education.root },
          { name: 'List' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.education.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Education
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 3 }}>
        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Stack spacing={3}>
            {educationData?.education?.map((item: any) => (
              <Card key={item.id} sx={{ p: 3, border: (theme) => `solid 1px ${theme.vars.palette.divider}` }}>
                <Typography variant="h6">{item.institution}</Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  {item.degree} • {item.fieldOfStudy}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  {item.startYear} - {item.endYear || 'Present'}
                </Typography>
                {item.description && (
                  <Typography variant="body2" sx={{ mt: 1 }}>{item.description}</Typography>
                )}
              </Card>
            ))}
            {(!educationData?.education || educationData.education.length === 0) && (
              <Typography variant="body2" color="text.secondary">No education records found.</Typography>
            )}
          </Stack>
        )}
      </Card>
    </DashboardContent>
  );
}
